export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface InvoiceData {
  reference: string;
  issueDate: string;
  serviceDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceAddress: string;
  items: InvoiceItem[];
  addonPrices?: Record<string, number>;
  deposit: number;
  balance: number;
  total: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedBalance?: number;
  promotionCode?: string;
  logoSrc?: string;
}

const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;

export function renderInvoiceHtml(data: InvoiceData): string {
  const {
    reference,
    issueDate,
    serviceDate,
    customerName,
    customerEmail,
    customerPhone,
    serviceAddress,
    items,
    addonPrices = {},
    deposit,
    balance,
    total,
    discountAmount = 0,
    discountPercent,
    discountedBalance,
    promotionCode,
    logoSrc,
  } = data;

  const discountValue = Number(discountAmount || 0);
  const hasDiscount = discountValue > 0;
  const effectiveDiscountedBalance =
    discountedBalance != null
      ? Number(discountedBalance)
      : Math.max(balance - discountValue, 0);
  const totalDue = hasDiscount ? deposit + effectiveDiscountedBalance : total;
  const discountLabel = promotionCode
    ? `Discount (${promotionCode}${discountPercent ? ` ${discountPercent}%` : ""})`
    : "Discount";

  const rows = (items || [])
    .map(
      (item) => `
        <tr>
          <td>${item.description || ""}</td>
          <td class="amount">${money(item.amount)}</td>
        </tr>`
    )
    .join("") || "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${reference}</title>
  <style>
    * { box-sizing: border-box; }
    @page { margin: 0; }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 18mm;
      color: #111827;
    }
    .wrapper {
      border: 1px solid #d1d5db;
      padding: 24px;
      min-height: calc(100vh - 36mm);
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .logo-block img { width: 90px; }
    .company { text-align: right; line-height: 1.5; }
    .company h2 { margin: 0 0 4px; font-size: 18px; letter-spacing: 1px; }
    .muted { color: #6b7280; font-size: 13px; }
    .detail-grid { display: flex; justify-content: space-between; margin-top: 32px; }
    .left-details { line-height: 1.6; font-size: 14px; max-width: 60%; }
    .right-details { text-align: right; font-size: 14px; line-height: 1.6; }
    .table { width: 100%; margin-top: 32px; border-collapse: collapse; }
    .table th { background: #e5e7eb; color: #111827; padding: 10px; text-align: left; font-size: 13px; letter-spacing: .5px; }
    .table th.amount { text-align: right; }
    .table td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .amount { text-align: right; }
    .totals { margin-top: 12px; margin-left: auto; width: 280px; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
    .totals-row { display: grid; grid-template-columns: 1fr auto; align-items: center; }
    .totals-row strong { text-align: left; padding-right: 16px; }
    .grand-total { margin-top: 8px; text-align: right; font-size: 18px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-block">
        <img src="${logoSrc || "/images/logo.png"}" alt="Detail Geeks Auto Spa" />
      </div>
      <div class="company">
        <div>Detail Geeks Auto Spa</div>
        <div class="muted">support@detailgeeksautospa.com</div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="left-details">
        <div>${customerName}</div>
        <div>${serviceAddress}</div>
        <div>${customerEmail}</div>
        ${customerPhone ? `<div>${customerPhone}</div>` : ""}
      </div>
      <div class="right-details">
        <div><span class="muted">Invoice No.: </span><strong>${reference}</strong></div>
        <div><span class="muted">Issue date: </span><strong>${issueDate}</strong></div>
        <div><span class="muted">Service date: </span><strong>${serviceDate}</strong></div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width: 70%; background: #e5e7eb; color: #111827;">DESCRIPTION</th>
          <th class="amount" style="width: 30%; background: #e5e7eb; color: #111827;">AMOUNT ($)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <strong>Deposit Amount:</strong>
        <span>${money(deposit)}</span>
      </div>
      <div class="totals-row">
        <strong>Balance Due at Service:</strong>
        <span>${money(balance)}</span>
      </div>
      ${hasDiscount ? `
      <div class="totals-row">
        <strong>${discountLabel}:</strong>
        <span>- ${money(discountValue)}</span>
      </div>
      <div class="totals-row">
        <strong>New Balance Due at Service:</strong>
        <span>${money(effectiveDiscountedBalance)}</span>
      </div>
      ` : ""}
      <div class="totals-row">
        <strong>Total Amount${hasDiscount ? " (after discount)" : ""}:</strong>
        <span>${money(totalDue)}</span>
      </div>
    </div>

  </div>
</body>
</html>`;
}
