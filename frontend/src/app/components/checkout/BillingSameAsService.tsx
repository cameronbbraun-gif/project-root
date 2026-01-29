"use client";

import React from "react";

import type { ServiceAddress } from "@/app/book/book";

interface BillingSameAsServiceProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  serviceAddress?: ServiceAddress;
}

export default function BillingSameAsService({
  checked,
  onChange,
  serviceAddress,
}: BillingSameAsServiceProps) {
  const addressLine = serviceAddress
    ? [serviceAddress.street, serviceAddress.city, serviceAddress.state, serviceAddress.zip]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <label className="billing-same-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div>
        <div className="billing-same-title">Billing address same as service address</div>
        {addressLine ? <div className="billing-same-caption">{addressLine}</div> : null}
      </div>
    </label>
  );
}
