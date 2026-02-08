"use client";

import React from "react";
import { CardCvcElement, CardExpiryElement, CardNumberElement } from "@stripe/react-stripe-js";
import type { StripeCardNumberElementOptions } from "@stripe/stripe-js";

interface CardFormProps {
  disabled?: boolean;
}

const cardStyle: StripeCardNumberElementOptions["style"] = {
  base: {
    color: "#111827",
    fontSize: "16px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSmoothing: "antialiased",
    "::placeholder": {
      color: "#9ca3af",
    },
    iconColor: "#1d3753",
  },
  invalid: {
    color: "#b91c1c",
  },
};

export default function CardForm({ disabled = false }: CardFormProps) {
  return (
    <div className="card-form">
      <label className="card-field-label" htmlFor="card-number">
        Card number
      </label>
      <div className={`card-field ${disabled ? "is-disabled" : ""}`} id="card-number">
        <CardNumberElement options={{ style: cardStyle, showIcon: true }} />
      </div>

      <div className="card-field-grid">
        <div className="card-field-block">
          <label className="card-field-label" htmlFor="card-expiry">
            Expiration
          </label>
          <div className={`card-field ${disabled ? "is-disabled" : ""}`} id="card-expiry">
            <CardExpiryElement options={{ style: cardStyle }} />
          </div>
        </div>

        <div className="card-field-block">
          <label className="card-field-label" htmlFor="card-cvc">
            CVC
          </label>
          <div className={`card-field ${disabled ? "is-disabled" : ""}`} id="card-cvc">
            <CardCvcElement options={{ style: cardStyle }} />
          </div>
        </div>
      </div>
    </div>
  );
}
