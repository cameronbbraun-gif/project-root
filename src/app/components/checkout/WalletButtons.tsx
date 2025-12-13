"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import type {
  PaymentRequest as StripePaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";

type WalletKey = "applePay" | "googlePay" | "link";

const walletOrder: WalletKey[] = ["applePay", "googlePay", "link"];
const emptyRequests: Record<WalletKey, StripePaymentRequest | null> = {
  applePay: null,
  googlePay: null,
  link: null,
};

interface WalletButtonsProps {
  amount: number;
  createPaymentIntent: () => Promise<{ clientSecret?: string } | null>;
  onPaymentSuccess: () => void;
  onError: (message: string) => void;
  onProcessingChange?: (processing: boolean) => void;
  disabled?: boolean;
  termsAccepted: boolean;
}

export default function WalletButtons({
  amount,
  createPaymentIntent,
  onPaymentSuccess,
  onError,
  onProcessingChange,
  disabled = false,
  termsAccepted,
}: WalletButtonsProps) {
  const stripe = useStripe();
  const [paymentRequests, setPaymentRequests] =
    useState<Record<WalletKey, StripePaymentRequest | null>>(emptyRequests);
  const [availability, setAvailability] = useState<Record<WalletKey, boolean>>({
    applePay: false,
    googlePay: false,
    link: false,
  });

  useEffect(() => {
    if (!stripe || !amount || disabled) {
      setAvailability({
        applePay: false,
        googlePay: false,
        link: false,
      });
      setPaymentRequests(emptyRequests);
      return;
    }

    let mounted = true;
    const cancelHandlers: Array<() => void> = [];
    const nextRequests: Record<WalletKey, StripePaymentRequest | null> = { ...emptyRequests };

    walletOrder.forEach((wallet) => {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Booking Deposit",
          amount: Math.max(Math.round(amount * 100), 50),
        },
        requestPayerName: true,
        requestPayerEmail: true,
        disableWallets: walletOrder.filter((w) => w !== wallet),
      });

      pr.canMakePayment()
        .then((result) => {
          if (!mounted) return;
          setAvailability((prev) => ({ ...prev, [wallet]: Boolean(result?.[wallet]) }));
        })
        .catch(() => {
          if (!mounted) return;
          setAvailability((prev) => ({ ...prev, [wallet]: false }));
        });

      const handlePaymentMethod = async (event: PaymentRequestPaymentMethodEvent) => {
        if (!termsAccepted) {
          event.complete("fail");
          onError("Please agree to the terms before paying.");
          return;
        }

        try {
          onProcessingChange?.(true);
          onError("");

          const res = await createPaymentIntent();
          const clientSecret = res?.clientSecret;
          if (!clientSecret) {
            event.complete("fail");
            onError("Unable to start payment right now.");
            return;
          }

          const { error } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: event.paymentMethod.id },
            { handleActions: true }
          );

          if (error) {
            onError(error.message ?? "Payment failed. Please try another method.");
            event.complete("fail");
            return;
          }

          event.complete("success");
          onPaymentSuccess();
        } catch (err) {
          onError(err instanceof Error ? err.message : "Payment failed. Please try again.");
          event.complete("fail");
        } finally {
          onProcessingChange?.(false);
        }
      };

      pr.on("paymentmethod", handlePaymentMethod);
      cancelHandlers.push(() => pr.off("paymentmethod", handlePaymentMethod));
      nextRequests[wallet] = pr;
    });

    setPaymentRequests(nextRequests);

    return () => {
      mounted = false;
      cancelHandlers.forEach((off) => off());
      setPaymentRequests(emptyRequests);
    };
  }, [
    stripe,
    amount,
    createPaymentIntent,
    onError,
    onPaymentSuccess,
    onProcessingChange,
    termsAccepted,
    disabled,
  ]);

  const activeWallets = useMemo(
    () => walletOrder.filter((wallet) => availability[wallet] && paymentRequests[wallet]),
    [availability, paymentRequests]
  );

  if (!stripe || activeWallets.length === 0) return null;

  return (
    <div className={`wallet-button-grid ${disabled ? "is-disabled" : ""}`}>
      {activeWallets.map((wallet) => (
        <div key={wallet} className="wallet-button">
          <PaymentRequestButtonElement
            options={{
              paymentRequest: paymentRequests[wallet] as StripePaymentRequest,
              style: {
                paymentRequestButton: {
                  height: "44px",
                  theme: "dark",
                  type: "default",
                },
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}
