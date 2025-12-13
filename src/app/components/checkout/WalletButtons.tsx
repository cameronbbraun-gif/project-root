"use client";

import React, { useEffect, useRef, useState } from "react";
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import type {
  PaymentRequest as StripePaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";

interface WalletButtonsProps {
  amount: number;
  createPaymentIntent: () => Promise<{ clientSecret?: string } | null>;
  onPaymentSuccess: () => void;
  onError: (message: string) => void;
  onProcessingChange?: (processing: boolean) => void;
  disabled?: boolean;
  termsAccepted: boolean;
}

const paymentButtonStyle = {
  paymentRequestButton: {
    theme: "dark" as const,
    type: "default" as const,
  },
};

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
  const [canPay, setCanPay] = useState(false);
  const paymentRequestRef = useRef<StripePaymentRequest | null>(null);
  const paymentHandlerRef = useRef<((event: PaymentRequestPaymentMethodEvent) => void) | null>(
    null
  );
  const latestCallbacksRef = useRef({
    termsAccepted,
    createPaymentIntent,
    onError,
    onProcessingChange,
    onPaymentSuccess,
  });

  useEffect(() => {
    latestCallbacksRef.current = {
      termsAccepted,
      createPaymentIntent,
      onError,
      onProcessingChange,
      onPaymentSuccess,
    };
  }, [termsAccepted, createPaymentIntent, onError, onProcessingChange, onPaymentSuccess]);

  useEffect(() => {
    if (!stripe || paymentRequestRef.current) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Booking Deposit",
        amount: 50,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const handlePaymentMethod = async (event: PaymentRequestPaymentMethodEvent) => {
      const callbacks = latestCallbacksRef.current;
      if (!stripe) {
        event.complete("fail");
        callbacks.onError("Payment system isn\u2019t ready. Please try again.");
        return;
      }

      const {
        termsAccepted: latestTerms,
        onError: latestOnError,
        onProcessingChange: latestOnProcessingChange,
        createPaymentIntent: latestCreatePaymentIntent,
        onPaymentSuccess: latestOnPaymentSuccess,
      } = callbacks;

      if (!latestTerms) {
        event.complete("fail");
        latestOnError("Please agree to the terms before paying.");
        return;
      }

      try {
        latestOnProcessingChange?.(true);
        latestOnError("");

        const res = await latestCreatePaymentIntent();
        const clientSecret = res?.clientSecret;
        if (!clientSecret) {
          event.complete("fail");
          latestOnError("Unable to start payment right now.");
          return;
        }

        const { error } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: true }
        );

        if (error) {
          latestOnError(error.message ?? "Payment failed. Please try another method.");
          event.complete("fail");
          return;
        }

        event.complete("success");
        latestOnPaymentSuccess();
      } catch (err) {
        latestOnError(err instanceof Error ? err.message : "Payment failed. Please try again.");
        event.complete("fail");
      } finally {
        latestOnProcessingChange?.(false);
      }
    };

    paymentRequestRef.current = pr;
    paymentHandlerRef.current = handlePaymentMethod;
    pr.on("paymentmethod", handlePaymentMethod);

    let mounted = true;
    pr.canMakePayment()
      .then((result) => {
        if (!mounted) return;
        setCanPay(Boolean(result));
      })
      .catch(() => {
        if (!mounted) return;
        setCanPay(false);
      });

    return () => {
      mounted = false;
      if (paymentRequestRef.current && paymentHandlerRef.current) {
        paymentRequestRef.current.off("paymentmethod", paymentHandlerRef.current);
      }
      paymentRequestRef.current = null;
      paymentHandlerRef.current = null;
      setCanPay(false);
    };
  }, [stripe]);

  useEffect(() => {
    let mounted = true;
    const pr = paymentRequestRef.current;
    if (!pr) return;

    if (!stripe || !amount || amount <= 0 || disabled) {
      setCanPay(false);
      return;
    }

    pr.update({
      total: {
        label: "Booking Deposit",
        amount: Math.max(Math.round(amount * 100), 50),
      },
    });

    pr.canMakePayment()
      .then((result) => {
        if (!mounted) return;
        setCanPay(Boolean(result));
      })
      .catch(() => {
        if (!mounted) return;
        setCanPay(false);
      });

    return () => {
      mounted = false;
    };
  }, [amount, disabled, stripe]);

  if (!stripe || !paymentRequestRef.current || !canPay) return null;

  return (
    <div className={`wallet-button-grid ${disabled ? "is-disabled" : ""}`}>
      <div className="wallet-button">
        <PaymentRequestButtonElement
          options={{
            paymentRequest: paymentRequestRef.current,
            style: paymentButtonStyle,
            disableMultipleButtons: false,
          }}
        />
      </div>
    </div>
  );
}
