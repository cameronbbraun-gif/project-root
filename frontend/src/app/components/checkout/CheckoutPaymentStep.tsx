"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiUrl } from "@/lib/api";

import {
  BookingPaymentSummary,
  PAYMENT_SUMMARY_EVENT,
  ServiceAddress,
  clearBookingFormState,
  generateBookingReference,
  getBookingPaymentSummary,
  clearPendingBookingSummary,
  persistLatestBookingSummary,
  persistPendingBookingSummary,
  readPendingBooking,
  saveBookingFormState,
  validateBookingForPayment,
} from "@/app/book/book";

import BillingAddress from "./BillingAddress";
import BillingSameAsService from "./BillingSameAsService";
import CardForm from "./CardForm";
import WalletButtons from "./WalletButtons";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type AppliedPromo = {
  code: string;
  percentOff: number;
  promotionCodeId?: string;
  couponId?: string;
};

function CheckoutPaymentStepInner() {
  const stripe = useStripe();
  const elements = useElements();
  const processingRef = useRef(false);
  const pendingRef = useRef<{ reference: string; summary: BookingPaymentSummary } | null>(null);
  const redirectHandledRef = useRef(false);
  const termsErrorMessage = "Please agree to the terms before paying.";

  const [summary, setSummary] = useState<BookingPaymentSummary | null>(null);
  const [billingAddress, setBillingAddress] = useState<ServiceAddress>({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [sameAsService, setSameAsService] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "applied" | "error">("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const next = getBookingPaymentSummary();
    setSummary(next);
    if (sameAsService && next?.serviceAddress) {
      setBillingAddress(next.serviceAddress);
    }

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BookingPaymentSummary>).detail;
      setSummary(detail);
      if (sameAsService && detail?.serviceAddress) {
        setBillingAddress(detail.serviceAddress);
      }
    };

    document.addEventListener(PAYMENT_SUMMARY_EVENT, handler as EventListener);
    return () => {
      document.removeEventListener(PAYMENT_SUMMARY_EVENT, handler as EventListener);
    };
  }, [sameAsService]);


  const billingDetails = useMemo(
    () => ({
      name: summary?.customerName || "",
      email: summary?.email || "",
      address: {
        line1: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        postal_code: billingAddress.zip,
      },
    }),
    [summary, billingAddress]
  );

  const discountAmount = useMemo(() => {
    if (!summary || !appliedPromo) return 0;
    const raw = (summary.balance * appliedPromo.percentOff) / 100;
    const rounded = Math.round(raw * 100) / 100;
    return Math.min(Math.max(rounded, 0), summary.balance);
  }, [summary, appliedPromo]);

  const discountedBalance = useMemo(() => {
    if (!summary) return 0;
    return Math.max(summary.balance - discountAmount, 0);
  }, [summary, discountAmount]);

  const buildSummaryWithPromo = useCallback(
    (baseSummary: BookingPaymentSummary): BookingPaymentSummary => ({
      ...baseSummary,
      discountPercent: appliedPromo?.percentOff,
      discountAmount: appliedPromo ? Number(discountAmount.toFixed(2)) : undefined,
      discountedBalance: appliedPromo ? Number(discountedBalance.toFixed(2)) : undefined,
      promotionCode: appliedPromo?.code,
      promotionCodeId: appliedPromo?.promotionCodeId,
    }),
    [appliedPromo, discountAmount, discountedBalance]
  );

  const formatCurrency = useCallback((amount: number) => `$${amount.toFixed(2)}`, []);

  const handlePromoInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPromoInput(value);
      if (appliedPromo && value.trim().toLowerCase() !== appliedPromo.code.toLowerCase()) {
        setAppliedPromo(null);
        setPromoStatus("idle");
        setPromoMessage("");
      }
    },
    [appliedPromo]
  );

  const applyPromoCode = useCallback(async () => {
    const code = promoInput.trim();
    if (!code) {
      setPromoStatus("error");
      setPromoMessage("Promo code failed. Please check the code and try again.");
      setAppliedPromo(null);
      return;
    }

    setPromoStatus("loading");
    setPromoMessage("Checking code...");

    try {
      const res = await fetch(apiUrl("/api/stripe/validate-promo"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Unable to validate promotion code.");
      }

      if (!data?.valid || !data?.percentOff) {
        const reason = data?.reason;
        const failureMessage =
          reason === "percent_only"
            ? "Promo code failed. Only percentage discounts are supported."
            : "Promo code failed. Please check the code and try again.";
        setPromoStatus("error");
        setPromoMessage(failureMessage);
        setAppliedPromo(null);
        return;
      }

      const appliedCode = String(data.code || code).trim();
      setAppliedPromo({
        code: appliedCode,
        percentOff: Number(data.percentOff),
        promotionCodeId: data.promotionCodeId,
        couponId: data.couponId,
      });
      setPromoInput(appliedCode);
      setPromoStatus("applied");
      setPromoMessage(`${appliedCode} - ${Number(data.percentOff)}% discount applied.`);
    } catch (err) {
      setPromoStatus("error");
      setPromoMessage("Promo code failed. Please check the code and try again.");
      setAppliedPromo(null);
    }
  }, [promoInput]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoStatus("idle");
    setPromoMessage("Promo code removed.");
  }, []);

  const preparePayment = useCallback(() => {
    if (!summary) {
      throw new Error("Booking details are missing. Please review your selections.");
    }

    const reference = pendingRef.current?.reference || generateBookingReference();
    const summaryWithPromo = buildSummaryWithPromo(summary);

    pendingRef.current = { reference, summary: summaryWithPromo };
    persistPendingBookingSummary(summaryWithPromo, reference);
    saveBookingFormState();

    return { reference, summary: summaryWithPromo };
  }, [summary, buildSummaryWithPromo, saveBookingFormState]);

  const createPaymentIntent = useCallback(async () => {
    const valid = await validateBookingForPayment();
    if (!valid) {
      throw new Error("Please complete all required booking steps before paying.");
    }

    if (!summary || summary.deposit <= 0) {
      throw new Error("Booking details are missing. Please review your selections.");
    }

    const res = await fetch(apiUrl("/api/stripe/create-payment-intent"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: summary.deposit,
        email: summary.email,
        phone: summary.phone,
        name: summary.customerName || "Detail Geeks customer",
        description: summary.packageName
          ? `Deposit for ${summary.packageName}`
          : "Detail Geeks booking deposit",
        metadata: {
          packageName: summary.packageName,
          addons: summary.addons.join(", ") || "None",
          total: summary.total.toFixed(2),
          deposit: summary.deposit.toFixed(2),
          balance: summary.balance.toFixed(2),
          promoCode: appliedPromo?.code || "",
          promoPercentOff: appliedPromo ? String(appliedPromo.percentOff) : "",
          promoDiscountAmount: appliedPromo ? discountAmount.toFixed(2) : "",
          promoDiscountedBalance: appliedPromo ? discountedBalance.toFixed(2) : "",
          promoPromotionCodeId: appliedPromo?.promotionCodeId || "",
          promoCouponId: appliedPromo?.couponId || "",
          dateTime: summary.dateTimeText,
          vehicle: summary.vehicleLine,
          serviceStreet: summary.serviceAddress.street,
          serviceCity: summary.serviceAddress.city,
          serviceState: summary.serviceAddress.state,
          serviceZip: summary.serviceAddress.zip,
        },
      }),
    });

    if (!res.ok) {
      throw new Error("Unable to start payment right now. Please try again.");
    }

    return (await res.json()) as { clientSecret?: string; paymentIntentId?: string };
  }, [summary, appliedPromo, discountAmount, discountedBalance]);

  const saveBooking = useCallback(
    async (
      reference: string,
      paymentIntentId?: string,
      summaryOverride?: BookingPaymentSummary
    ) => {
      const activeSummary = summaryOverride || summary;
      if (!activeSummary) {
        throw new Error("Booking details are missing. Please review your selections.");
      }

      const pricingDiscountPercent =
        summaryOverride?.discountPercent ?? appliedPromo?.percentOff ?? null;
      const pricingDiscountAmount =
        summaryOverride?.discountAmount ??
        (appliedPromo ? Number(discountAmount.toFixed(2)) : null);
      const pricingDiscountedBalance =
        summaryOverride?.discountedBalance ??
        (appliedPromo ? Number(discountedBalance.toFixed(2)) : null);
      const pricingPromotionCode =
        summaryOverride?.promotionCode || appliedPromo?.code || "";
      const pricingPromotionCodeId =
        summaryOverride?.promotionCodeId || appliedPromo?.promotionCodeId || "";

      const payload = {
        reference,
        customer: {
          name: activeSummary.customerName,
          email: activeSummary.email,
          phone: activeSummary.phone,
        },
        service: {
          packageName: activeSummary.packageName,
          packagePrice: activeSummary.packagePrice,
          addons: activeSummary.addons,
          addonDetails: activeSummary.addonDetails,
          vehicleLine: activeSummary.vehicleLine,
          serviceAddress: activeSummary.serviceAddress,
        },
        schedule: {
          dateTimeText: activeSummary.dateTimeText,
          date: activeSummary.selectedDate || "",
          time: activeSummary.selectedTime || "",
          durationMinutes: activeSummary.durationMinutes ?? null,
        },
        pricing: {
          total: activeSummary.total,
          deposit: activeSummary.deposit,
          balance: activeSummary.balance,
          addonPrices: activeSummary.addonPrices,
          discountPercent: pricingDiscountPercent,
          discountAmount: pricingDiscountAmount,
          discountedBalance: pricingDiscountedBalance,
          promotionCode: pricingPromotionCode,
          promotionCodeId: pricingPromotionCodeId,
        },
        notes: {
          instructions: activeSummary.additionalInstructions || "",
        },
        paymentIntentId: paymentIntentId || null,
      };

      const res = await fetch(apiUrl("/api/bookings?async=1"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Unable to save booking.");
      }
    },
    [summary, appliedPromo, discountAmount, discountedBalance]
  );

  const handlePaymentSuccess = useCallback(
    async (
      paymentIntentId?: string,
      referenceOverride?: string,
      summaryOverride?: BookingPaymentSummary
    ) => {
      const pending = pendingRef.current || readPendingBooking();
      const baseSummary = summaryOverride || pending?.summary || summary;
      if (!baseSummary) {
        throw new Error("Booking details are missing. Please review your selections.");
      }

      const reference = referenceOverride || pending?.reference || generateBookingReference();
      const summaryWithPromo = summaryOverride || buildSummaryWithPromo(baseSummary);

      persistLatestBookingSummary(summaryWithPromo, reference);
      setMessage("");
      setSuccessMessage("Saving your booking...");

      try {
        await saveBooking(reference, paymentIntentId, summaryWithPromo);
        setSuccessMessage("Booking saved! Redirecting...");
        clearPendingBookingSummary();
        pendingRef.current = null;
        setTimeout(() => {
          clearBookingFormState();
          window.location.href = "/book/booking-success";
        }, 400);
      } catch {
        setSuccessMessage("");
        setMessage("Payment succeeded, but we couldn't save your booking. Please contact support.");
        saveBookingFormState();
      }
    },
    [
      buildSummaryWithPromo,
      clearBookingFormState,
      saveBooking,
      saveBookingFormState,
      summary,
    ]
  );

  const handlePaymentFailure = useCallback(
    (errorMessage: string) => {
      setSuccessMessage("");
      setMessage(errorMessage);
      saveBookingFormState();
      if (typeof window !== "undefined") {
        window.location.href = "/book/booking-error";
      }
    },
    [saveBookingFormState]
  );

  const handleCardPayment = useCallback(async () => {
    if (processingRef.current) {
      return;
    }
    if (!stripe || !elements) {
      setMessage("Payment is still initializing. Please try again.");
      return;
    }
    if (!termsAccepted) {
      setMessage(termsErrorMessage);
      return;
    }
    if (!summary || summary.deposit <= 0) {
      setMessage("Booking details are missing. Please review your selections.");
      return;
    }

    const card = elements.getElement(CardNumberElement);
    if (!card) {
      setMessage("Enter your card details to continue.");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setMessage("");

    try {
      const pending = preparePayment();
      const intent = await createPaymentIntent();
      if (!intent?.clientSecret) {
        throw new Error("Unable to start payment right now. Please try again.");
      }

      const fallbackIntentId =
        intent.paymentIntentId ||
        (intent.clientSecret ? intent.clientSecret.split("_secret")[0] : undefined);

      const { error, paymentIntent } = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card,
          billing_details: billingDetails,
        },
        return_url: `${window.location.origin}/book`,
      });

      if (error) {
        throw new Error(error.message ?? "Payment failed. Please try another card.");
      }

      await handlePaymentSuccess(
        paymentIntent?.id || fallbackIntentId,
        pending?.reference,
        pending?.summary
      );
    } catch (err) {
      const friendlyMessage = err instanceof Error ? err.message : "Payment failed. Please try again.";
      handlePaymentFailure(friendlyMessage);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [
    stripe,
    elements,
    termsAccepted,
    summary,
    createPaymentIntent,
    billingDetails,
    handlePaymentSuccess,
    handlePaymentFailure,
    preparePayment,
  ]);

  useEffect(() => {
    if (!stripe || redirectHandledRef.current) return;
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const clientSecret = params.get("payment_intent_client_secret");
    const redirectStatus = params.get("redirect_status");

    if (!clientSecret && !redirectStatus) return;
    redirectHandledRef.current = true;

    const pending = readPendingBooking();
    if (pending?.summary && !summary) {
      setSummary(pending.summary);
    }

    const cleanUrl = () => {
      ["payment_intent_client_secret", "payment_intent", "redirect_status"].forEach((key) =>
        params.delete(key)
      );
      window.history.replaceState({}, "", url.toString());
    };

    const finalize = async () => {
      if (!clientSecret) {
        cleanUrl();
        return;
      }

      try {
        setIsProcessing(true);
        setMessage("");
        setSuccessMessage("Confirming your payment...");

        const result = await stripe.retrievePaymentIntent(clientSecret);
        const paymentIntent = result.paymentIntent;

        if (!paymentIntent) {
          throw new Error("Unable to confirm payment. Please contact support.");
        }

        if (paymentIntent.status === "succeeded") {
          await handlePaymentSuccess(
            paymentIntent.id,
            pending?.reference,
            pending?.summary
          );
        } else if (paymentIntent.status === "processing") {
          setSuccessMessage("Your payment is processing. We'll email you shortly.");
        } else {
          const statusMsg =
            paymentIntent.status === "requires_payment_method"
              ? "Payment failed. Please try another card."
              : "Payment could not be confirmed. Please contact support.";
          handlePaymentFailure(statusMsg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to confirm payment.";
        handlePaymentFailure(msg);
      } finally {
        setIsProcessing(false);
        cleanUrl();
      }
    };

    void finalize();
  }, [stripe, summary, handlePaymentSuccess, handlePaymentFailure]);

  const depositDisplay =
    summary?.deposit != null ? `$${summary.deposit.toFixed(2)}` : "—";
  const depositAmount = summary?.deposit ?? 0;
  const balanceAmount = summary?.balance ?? 0;
  const showDiscount = Boolean(appliedPromo && discountAmount > 0);

  return (
    <div
      className="w-layout-vflex flex-block-338 form-step"
      data-step="5"
      id="step-5"
      role="region"
      aria-labelledby="step-5-label"
    >
      <h4 className="heading-12" id="step-5-label">
        Review &amp; Confirm
      </h4>
      <h5 className="heading-13">
        Double-check your booking details before completing your request.
      </h5>

      <div className="checkout-payment-grid">
        <div className="order-summary-card">
          <div className="order-summary-header">Order Summary</div>

          <div className="order-line" id="order-primary-line">
            <div className="order-line-text">
              <div className="order-line-title" id="order-service-name">Premium Full Detail</div>
              <div className="order-line-subtitle" id="order-service-subtitle">Complete interior &amp; exterior detailing</div>
            </div>
            <div className="order-line-price" id="order-service-price">$0</div>
          </div>

          <div className="order-addons" id="order-addons"></div>

          <div className="order-divider" />

          <div className="cost-summary-card">
            <div className="cost-summary-title">Cost Breakdown</div>

            <div className="cost-line">
              <div className="cost-line-label">Deposit Due:</div>
              <div id="cost-deposit" className="cost-line-value">
                {formatCurrency(depositAmount)}
              </div>
            </div>

            <div className="cost-divider" />

            <div className="cost-line">
              <div className="cost-line-label">Balance Due at Service:</div>
              <div id="cost-balance" className="cost-line-value">
                {formatCurrency(balanceAmount)}
              </div>
            </div>

            {showDiscount ? (
              <>
                <div className="cost-divider" />
                <div className="cost-line cost-line--discount">
                  <div className="cost-line-label">
                    Discount ({appliedPromo?.code} {appliedPromo?.percentOff}%):
                  </div>
                  <div className="cost-line-value">
                    - {formatCurrency(discountAmount)}
                  </div>
                </div>
                <div className="cost-line cost-line--total">
                  <div className="cost-line-label">New total due at service:</div>
                  <div className="cost-line-value">
                    {formatCurrency(discountedBalance)}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="promo-code-card">
            <div className="promo-code-title">Coupon / Discount Code</div>
            <div className="promo-code-form">
              <input
                id="promo-code"
                className="promo-code-input"
                type="text"
                placeholder="Enter code"
                value={promoInput}
                onChange={handlePromoInputChange}
                autoComplete="off"
                autoCapitalize="characters"
                disabled={promoStatus === "loading"}
              />
              <button
                type="button"
                className="promo-code-button"
                onClick={applyPromoCode}
                disabled={promoStatus === "loading"}
              >
                {promoStatus === "loading" ? "Checking..." : "Apply"}
              </button>
              {appliedPromo ? (
                <button
                  type="button"
                  className="promo-code-button promo-code-button--ghost"
                  onClick={removePromoCode}
                  disabled={promoStatus === "loading"}
                >
                  Remove
                </button>
              ) : null}
            </div>
            {promoMessage ? (
              <div
                className={`promo-code-message ${
                  promoStatus === "error" ? "is-error" : promoStatus === "applied" ? "is-success" : ""
                }`}
                role={promoStatus === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {promoMessage}
              </div>
            ) : null}
          </div>

          <div className="order-info-box">
            <div className="order-info-row">
              <img src="/images/calendar.svg" alt="" />
              <span id="order-date-time">Select a date &amp; time</span>
            </div>
            <div className="order-info-row">
              <img src="/images/address.svg" alt="" />
              <span id="order-address">Add your service address</span>
            </div>
            <div className="order-info-row">
              <img src="/images/car.svg" alt="" />
              <span id="order-vehicle">Add vehicle details</span>
            </div>
          </div>
        </div>

        <div className="payment-panel">
          <div className="payment-panel-header">
            <div>
              <div className="payment-title">Payment</div>
              <div className="payment-subtitle">Pay your booking deposit to confirm.</div>
            </div>
            <div className="deposit-chip">Deposit {depositDisplay}</div>
          </div>

          <div className="wallet-section">
            <WalletButtons
              amount={summary?.deposit ?? 0}
              onPreparePayment={preparePayment}
              createPaymentIntent={createPaymentIntent}
              onPaymentSuccess={handlePaymentSuccess}
              onError={(msg) => {
                setSuccessMessage("");
                setMessage(msg);
              }}
              onPaymentFailure={handlePaymentFailure}
              onProcessingChange={setIsProcessing}
              disabled={isProcessing}
              termsAccepted={termsAccepted}
            />
          </div>

          <div className="payment-divider" />

          <CardForm disabled={isProcessing} />

          <BillingSameAsService
            checked={sameAsService}
            onChange={(checked) => {
              setSameAsService(checked);
              if (checked && summary?.serviceAddress) {
                setBillingAddress(summary.serviceAddress);
              }
            }}
            serviceAddress={summary?.serviceAddress}
          />

          <BillingAddress
            value={billingAddress}
            onChange={setBillingAddress}
            disabled={sameAsService || isProcessing}
          />

          <label className="terms-check">
            <input
              type="checkbox"
              id="terms-agree"
              name="terms-agree"
              checked={termsAccepted}
              onChange={(event) => {
                const next = event.target.checked;
                setTermsAccepted(next);
                if (next && message === termsErrorMessage) {
                  setMessage("");
                }
              }}
            />
            <span>
              I agree to the{" "}
              <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="terms-link">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="terms-link">Privacy Policy</a>.
              {" "}I understand that a <span id="terms-deposit-amount">$50</span> deposit is required to secure my booking and the remaining balance will be collected on service day.
            </span>
          </label>

          {successMessage ? <div className="payment-success" role="status">{successMessage}</div> : null}
          {message ? <div className="payment-error" role="alert">{message}</div> : null}

          <div className="payment-actions">
            <a href="#" className="back-button w-inline-block" data-back>
              <img src="/images/back.svg" className="back-arrow" />
              <div className="back-text">Back</div>
            </a>
            <button
              type="button"
              className="button-primary-7 w-inline-block"
              onClick={handleCardPayment}
              disabled={isProcessing}
            >
              <div className="nexttext">{isProcessing ? "Processing..." : "Confirm Booking"}</div>
              <img src="/images/next.svg" className="nextarrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPaymentStep() {
  if (!stripePromise) {
    return (
      <div
        className="w-layout-vflex flex-block-338 form-step"
        data-step="5"
        id="step-5"
        role="region"
        aria-labelledby="step-5-label"
      >
        <h4 className="heading-12" id="step-5-label">
          Review &amp; Confirm
        </h4>
        <div className="payment-error" role="alert">
          Stripe is not configured yet. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: "stripe" } }}>
      <CheckoutPaymentStepInner />
    </Elements>
  );
}
