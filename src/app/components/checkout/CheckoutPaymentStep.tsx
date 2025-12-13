"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import {
  BookingPaymentSummary,
  PAYMENT_SUMMARY_EVENT,
  ServiceAddress,
  getBookingPaymentSummary,
} from "@/app/book/book";

import BillingAddress from "./BillingAddress";
import BillingSameAsService from "./BillingSameAsService";
import CardForm from "./CardForm";
import WalletButtons from "./WalletButtons";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function CheckoutPaymentStepInner() {
  const stripe = useStripe();
  const elements = useElements();

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

  useEffect(() => {
    if (termsAccepted && message) {
      setMessage("");
    }
  }, [termsAccepted, message]);

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

  const createPaymentIntent = useCallback(async () => {
    if (!summary || summary.deposit <= 0) {
      throw new Error("Booking details are missing. Please review your selections.");
    }

    const res = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: summary.deposit,
        email: billingDetails.email || summary.email,
        name: billingDetails.name || summary.customerName || "Detail Geeks customer",
        description: summary.packageName
          ? `Deposit for ${summary.packageName}`
          : "Detail Geeks booking deposit",
        metadata: {
          packageName: summary.packageName,
          addons: summary.addons.join(", ") || "None",
          total: summary.total.toFixed(2),
          deposit: summary.deposit.toFixed(2),
          balance: summary.balance.toFixed(2),
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

    return (await res.json()) as { clientSecret?: string };
  }, [summary, billingDetails]);

  const handlePaymentSuccess = useCallback(() => {
    window.location.href = "/book/booking-success";
  }, []);

  const handleCardPayment = useCallback(async () => {
    if (!stripe || !elements) {
      setMessage("Payment is still initializing. Please try again in a moment.");
      return;
    }
    if (!termsAccepted) {
      setMessage("Please agree to the terms before paying.");
      return;
    }
    if (!summary) {
      setMessage("Booking details are missing. Please review your selections.");
      return;
    }

    const card = elements.getElement(CardNumberElement);
    if (!card) {
      setMessage("Enter your card details to continue.");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const intent = await createPaymentIntent();
      if (!intent?.clientSecret) {
        throw new Error("Unable to start payment right now. Please try again.");
      }

      const { error } = await stripe.confirmCardPayment(intent.clientSecret, {
        payment_method: {
          card,
          billing_details: billingDetails,
        },
      });

      if (error) {
        throw new Error(error.message ?? "Payment failed. Please try another card.");
      }

      handlePaymentSuccess();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, termsAccepted, summary, createPaymentIntent, billingDetails, handlePaymentSuccess]);

  const depositDisplay =
    summary?.deposit != null ? `$${summary.deposit.toFixed(2)}` : "—";

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
              <div className="cost-line-label">Service Total:</div>
              <div id="cost-service-total" className="cost-line-value">$0.00</div>
            </div>

            <div className="cost-line">
              <div className="cost-line-label">Deposit Due:</div>
              <div id="cost-deposit" className="cost-line-value">$0.00</div>
            </div>

            <div className="cost-divider" />

            <div className="cost-line">
              <div className="cost-line-label">Balance Due at Service:</div>
              <div id="cost-balance" className="cost-line-value">$0.00</div>
            </div>
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

          <WalletButtons
            amount={summary?.deposit ?? 0}
            createPaymentIntent={createPaymentIntent}
            onPaymentSuccess={handlePaymentSuccess}
            onError={(msg) => setMessage(msg)}
            onProcessingChange={setIsProcessing}
            disabled={isProcessing}
            termsAccepted={termsAccepted}
          />

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
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span>
              I agree to the{" "}
              <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="terms-link">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="terms-link">Privacy Policy</a>.
              {" "}I understand that a <span id="terms-deposit-amount">$50</span> deposit is required to secure my booking and the remaining balance will be collected on service day.
            </span>
          </label>

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
          Stripe is not configured yet. Add NEXT_PUBLIC_STRIPE_PUBLIC_KEY or NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY to continue.
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
