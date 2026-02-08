"use client";

import React, { useEffect, useRef, useState } from "react";
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import type {
  PaymentRequest as StripePaymentRequest,
  PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";

interface WalletButtonsProps {
  amount: number;
  onPreparePayment?: () => void;
  createPaymentIntent: () => Promise<{ clientSecret?: string; paymentIntentId?: string } | null>;
  onPaymentSuccess: (paymentIntentId?: string) => void | Promise<void>;
  onError: (message: string) => void;
  onPaymentFailure?: (message: string) => void;
  onProcessingChange?: (processing: boolean) => void;
  disabled?: boolean;
  termsAccepted: boolean;
}

const paymentButtonStyle = {
  paymentRequestButton: {
    theme: "dark" as const,
    type: "default" as const,
    height: "44px",
  },
};

export default function WalletButtons({
  amount,
  onPreparePayment,
  createPaymentIntent,
  onPaymentSuccess,
  onError,
  onPaymentFailure,
  onProcessingChange,
  disabled = false,
  termsAccepted,
}: WalletButtonsProps) {
  const stripe = useStripe();
  const [canPay, setCanPay] = useState(false);
  const paymentRequestRef = useRef<StripePaymentRequest | null>(null);
  const paymentHandlerRef = useRef<((event: PaymentRequestPaymentMethodEvent) => void) | null>(null);
  const latestCallbacksRef = useRef({
    termsAccepted,
    onPreparePayment,
    createPaymentIntent,
    onError,
    onPaymentFailure,
    onProcessingChange,
    onPaymentSuccess,
    disabled,
  });

  latestCallbacksRef.current = {
    termsAccepted,
    onPreparePayment,
    createPaymentIntent,
    onError,
    onPaymentFailure,
    onProcessingChange,
    onPaymentSuccess,
    disabled,
  };

  useEffect(() => {
    const teardown = () => {
      if (paymentRequestRef.current && paymentHandlerRef.current) {
        paymentRequestRef.current.off("paymentmethod", paymentHandlerRef.current);
      }
      paymentRequestRef.current = null;
      paymentHandlerRef.current = null;
    };

    setCanPay(false);

    if (!stripe || !amount || amount <= 0) {
      teardown();
      return;
    }

    teardown();
    const stripeClient = stripe;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Booking Deposit",
        amount: Math.max(Math.round(amount * 100), 50),
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const handlePaymentMethod = async (event: PaymentRequestPaymentMethodEvent) => {
      const {
        termsAccepted: latestTerms,
        onError: latestOnError,
        onPaymentFailure: latestOnPaymentFailure,
        onProcessingChange: latestOnProcessingChange,
        createPaymentIntent: latestCreatePaymentIntent,
        onPaymentSuccess: latestOnPaymentSuccess,
        disabled: latestDisabled,
        onPreparePayment: latestOnPreparePayment,
      } = latestCallbacksRef.current;

      if (latestDisabled) {
        event.complete("fail");
        latestOnError("Another payment is already processing. Please wait.");
        return;
      }

      if (!latestTerms) {
        event.complete("fail");
        latestOnError("Please agree to the terms before paying.");
        return;
      }

      try {
        latestOnProcessingChange?.(true);
        latestOnError("");
        latestOnPreparePayment?.();

        const res = await latestCreatePaymentIntent();
        const clientSecret = res?.clientSecret;
        const fallbackIntentId =
          res?.paymentIntentId ||
          (clientSecret ? clientSecret.split("_secret")[0] : undefined);
        if (!clientSecret) {
          event.complete("fail");
          const message = "Unable to start payment right now.";
          latestOnError(message);
          latestOnPaymentFailure?.(message);
          return;
        }

        const confirmResult = await stripeClient.confirmCardPayment(
          clientSecret,
          {
            payment_method: event.paymentMethod.id,
            return_url: `${window.location.origin}/book`,
          },
          { handleActions: false }
        );

        if (confirmResult.error) {
          const message = confirmResult.error.message ?? "Payment failed. Please try another method.";
          latestOnError(message);
          latestOnPaymentFailure?.(message);
          event.complete("fail");
          return;
        }

        let paymentIntent = confirmResult.paymentIntent;
        if (!paymentIntent) {
          const message = "Payment could not be confirmed. Please try again.";
          latestOnError(message);
          latestOnPaymentFailure?.(message);
          event.complete("fail");
          return;
        }

        if (paymentIntent.status === "requires_action") {
          const actionResult = await stripeClient.confirmCardPayment(clientSecret, {
            return_url: `${window.location.origin}/book`,
          });
          if (actionResult.error) {
            const message =
              actionResult.error.message ?? "Payment failed. Please try another method.";
            latestOnError(message);
            latestOnPaymentFailure?.(message);
            event.complete("fail");
            return;
          }
          if (actionResult.paymentIntent) {
            paymentIntent = actionResult.paymentIntent;
          }
        }

        const finalStatus = paymentIntent.status;
        if (finalStatus !== "succeeded" && finalStatus !== "processing") {
          const message =
            finalStatus === "requires_payment_method"
              ? "Payment failed. Please try another method."
              : "Payment could not be confirmed. Please try again.";
          latestOnError(message);
          latestOnPaymentFailure?.(message);
          event.complete("fail");
          return;
        }

        event.complete("success");
        await latestOnPaymentSuccess(paymentIntent.id || fallbackIntentId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Payment failed. Please try again.";
        latestOnError(message);
        latestOnPaymentFailure?.(message);
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
      pr.off("paymentmethod", handlePaymentMethod);
      if (paymentRequestRef.current === pr) {
        paymentRequestRef.current = null;
        paymentHandlerRef.current = null;
      }
      setCanPay(false);
    };
  }, [amount, stripe]);

  if (!stripe || !paymentRequestRef.current || !canPay) return null;

  return (
    <div className={`wallet-button-grid ${disabled ? "is-disabled" : ""}`}>
      <div className="wallet-button">
        <PaymentRequestButtonElement
          options={{
            paymentRequest: paymentRequestRef.current,
            style: paymentButtonStyle,
          }}
        />
      </div>
    </div>
  );
}
