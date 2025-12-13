"use client";

import React from "react";

import type { ServiceAddress } from "@/app/book/book";

interface BillingAddressProps {
  value: ServiceAddress;
  onChange: (value: ServiceAddress) => void;
  disabled?: boolean;
}

export default function BillingAddress({
  value,
  onChange,
  disabled = false,
}: BillingAddressProps) {
  const handleChange =
    (key: keyof ServiceAddress) => (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: event.target.value });
    };

  return (
    <div className="billing-address-card">
      <label className="field-label-2" htmlFor="billing-street">
        Billing street address
      </label>
      <input
        id="billing-street"
        name="billing-street"
        className="text-field-2 w-input"
        placeholder="123 Main St"
        value={value.street}
        onChange={handleChange("street")}
        disabled={disabled}
      />

      <div className="billing-inline-grid">
        <div className="billing-field">
          <label className="field-label-2" htmlFor="billing-zip">
            ZIP
          </label>
          <input
            id="billing-zip"
            name="billing-zip"
            className="text-field-2 w-input"
            placeholder="12345"
            value={value.zip}
            onChange={handleChange("zip")}
            disabled={disabled}
          />
        </div>

        <div className="billing-field">
          <label className="field-label-2" htmlFor="billing-city">
            City
          </label>
          <input
            id="billing-city"
            name="billing-city"
            className="text-field-2 w-input"
            placeholder="City"
            value={value.city}
            onChange={handleChange("city")}
            disabled={disabled}
          />
        </div>

        <div className="billing-field">
          <label className="field-label-2" htmlFor="billing-state">
            State
          </label>
          <input
            id="billing-state"
            name="billing-state"
            className="text-field-2 w-input"
            placeholder="FL"
            value={value.state}
            onChange={handleChange("state")}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
