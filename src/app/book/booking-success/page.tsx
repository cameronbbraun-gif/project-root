"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { readLatestBooking } from "../book";
import { InvoiceData, renderInvoiceHtml } from "@/app/template/invoice";

interface DisplayBooking {
  reference: string;
  packageName: string;
  packagePrice: number;
  addons: string[];
  addonPrices?: Record<string, number>;
  addonDetails?: { name: string; price: number }[];
  dateLabel: string;
  timeLabel: string;
  serviceAddress: string;
  vehicleLine: string;
  customerName: string;
  email: string;
  phone: string;
  serviceTotal: number;
  deposit: number;
  balance: number;
  discountPercent?: number;
  discountAmount: number;
  discountedBalance: number;
  promotionCode?: string;
  totalAfterDiscount: number;
  total: number;
}

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

export default function BookingSuccess() {
  const [booking, setBooking] = useState<DisplayBooking | null>(null);

  useEffect(() => {
    const latest = readLatestBooking();
    if (latest?.summary) {
      const { summary, reference } = latest;
      const [dateLabel = summary.dateTimeText, timeLabel = ""] =
        summary.dateTimeText.split(" at ");
      const address = [
        summary.serviceAddress.street,
        summary.serviceAddress.city,
        summary.serviceAddress.state,
        summary.serviceAddress.zip,
      ]
        .filter(Boolean)
        .join(" ");

      const addonDetails =
        summary.addonDetails && summary.addonDetails.length
          ? summary.addonDetails
          : summary.addons.map((name) => ({
              name,
              price: Number(summary.addonPrices?.[name] || 0),
            }));
      const addonsTotal = addonDetails.reduce((sum, a) => sum + Number(a.price || 0), 0);
      const totalAmount =
        Number(summary.total || 0) || Number(summary.deposit || 0) + Number(summary.balance || 0);
      const packagePrice =
        Number(summary.packagePrice || 0) || Math.max(0, totalAmount - addonsTotal);
      const discountAmount = Number(summary.discountAmount || 0);
      const discountedBalance =
        summary.discountedBalance != null
          ? Number(summary.discountedBalance)
          : discountAmount > 0
            ? Math.max(summary.balance - discountAmount, 0)
            : summary.balance;
      const totalAfterDiscount = Number(summary.deposit || 0) + discountedBalance;

      setBooking({
        reference,
        packageName: summary.packageName || "Booking",
        packagePrice,
        addons: summary.addons,
        addonPrices: summary.addonPrices,
        addonDetails,
        dateLabel: dateLabel || summary.dateTimeText,
        timeLabel: timeLabel || "",
        serviceAddress: address || "Service address provided",
        vehicleLine: summary.vehicleLine || "Vehicle details provided",
        customerName: summary.customerName || "Customer",
        email: summary.email || "Email provided",
        phone: summary.phone || "Phone provided",
        serviceTotal: totalAmount,
        deposit: summary.deposit,
        balance: summary.balance,
        discountPercent: summary.discountPercent,
        discountAmount,
        discountedBalance,
        promotionCode: summary.promotionCode,
        totalAfterDiscount,
        total: totalAmount,
      });
    }
  }, []);

  const addonsContent = useMemo(() => {
    if (!booking) return null;
    if (!booking.addons.length) {
      return <li>No add-ons selected</li>;
    }
    return booking.addons.map((addon, idx) => <li key={idx}>{addon}</li>);
  }, [booking]);

  const handleDownloadReceipt = () => {
    if (!booking) {
      alert("Receipt is not ready yet. Please try again in a moment.");
      return;
    }
    const today = new Date();
    const issueDate = today.toLocaleDateString();
    const addonLines =
      booking.addonDetails && booking.addonDetails.length
        ? booking.addonDetails.map((a) => ({
            description: a.name,
            amount: Number(a.price || 0),
          }))
        : booking.addons.map((addon) => ({
            description: addon,
            amount: Number(booking.addonPrices?.[addon] || 0),
          }));

    const addonsTotal = addonLines.reduce((sum, a) => sum + (a.amount || 0), 0);
    const packageAmountRaw = Number(booking.packagePrice || 0);
    const totalAmount = Number(booking.total || 0) || Number(booking.deposit || 0) + Number(booking.balance || 0);
    const computedPackageAmount =
      packageAmountRaw > 0 ? packageAmountRaw : Math.max(0, totalAmount - addonsTotal);
    const discountAmount = Number(booking.discountAmount || 0);
    const discountedBalance =
      booking.discountedBalance != null
        ? Number(booking.discountedBalance)
        : discountAmount > 0
          ? Math.max(booking.balance - discountAmount, 0)
          : booking.balance;

    const data: InvoiceData = {
      reference: booking.reference,
      issueDate,
      serviceDate: booking.dateLabel,
      customerName: booking.customerName,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      serviceAddress: booking.serviceAddress,
      deposit: booking.deposit,
      balance: booking.balance,
      total: totalAmount,
      discountAmount,
      discountPercent: booking.discountPercent,
      discountedBalance,
      promotionCode: booking.promotionCode,
      items: [{ description: booking.packageName, amount: computedPackageAmount }, ...addonLines],
      addonPrices: booking.addonPrices,
    };

    const html = renderInvoiceHtml(data);
    const fileName = `invoice-${issueDate.replace(/\//g, "-")}`;
    const printableHtml = html.replace(/<title>[^<]*<\/title>/i, `<title>${fileName}</title>`);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.srcdoc = printableHtml;

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => iframe.remove(), 500);
      }
    };

    document.body.appendChild(iframe);
  };

  return (
    <html
      data-wf-page="6894d33fde9ebc41460da8a9"
      data-wf-site="685051eff25b20ed7a72c744"
    >
      <head>
        <meta charSet="utf-8" />
        <title>booking success</title>

        <meta content="booking success" property="og:title" />
        <meta content="booking success" property="twitter:title" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />

        <meta content="Webflow" name="generator" />

        <link href="../css/normalize.css" rel="stylesheet" />
        <link href="../css/webflow.css" rel="stylesheet" />
        <link href="../css/style.css" rel="stylesheet" />

        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />

        <Script
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          strategy="afterInteractive"
        />
        <Script
          id="webfont-inline"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              WebFont.load({
                google: {
                  families: [
                    "Outfit:100,200,300,regular,500,600,700,800,900",
                    "Roboto:100,200,300,regular,500,600,700,800,900,100italic,200italic,300italic,italic,500italic,600italic,700italic,800italic,900italic"
                  ]
                }
              });
            `,
          }}
        />
        <Script
          id="webflow-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(o,c){
                var n=c.documentElement,t=" w-mod-";
                n.className+=t+"js",
                ("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")
              }(window,document);
            `,
          }}
        />

        <link href="../images/favicon.png" rel="shortcut icon" />
        <link href="../images/webclip.png" rel="apple-touch-icon" />
      </head>

      <body>
        {/* ---------------- NAVBAR ---------------- */}
        <div className="navbar-logo-left-6">
          <div
            data-animation="default"
            data-collapse="medium"
            data-duration="400"
            data-easing="ease"
            data-easing2="ease"
            role="banner"
            className="navbar-logo-left-container-3 shadow-three w-nav"
          >
            <div className="container-23">
              <div className="navbar-wrapper-4">
                <Link href="/" className="navbar-brand-5 w-nav-brand">
                  <img
                    src="../images/favicon.png"
                    loading="lazy"
                    width="92"
                    sizes="91.98529052734375px"
                    alt=""
                    srcSet="
                      ../images/logo-p-500.png 500w,
                      ../images/logo-p-800.png 800w,
                      ../images/logo-p-1080.png 1080w,
                      ../images/logo-p-1600.png 1600w,
                      ../images/logo-p-2000.png 2000w,
                      ../images/logo-p-2600.png 2600w,
                      ../images/logo-p-3200.png 3200w,
                      ../images/favicon.png 4096w
                    "
                    className="image-13"
                  />
                  <h1 className="heading-3">Detail Geeks</h1>
                </Link>

                <nav
                  role="navigation"
                  className="nav-menu-wrapper-4 w-nav-menu"
                >
                  <ul role="list" className="nav-menu-two-3 w-list-unstyled">
                    <li>
                      <a href="/" className="nav-link-4">
                        Home
                      </a>
                    </li>
                    <li className="list-item">
                      <a href="/about-us" className="nav-link-4">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="/pricing" className="nav-link-4">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="nav-link-4">
                        Contact
                      </a>
                    </li>
                    <li>
                      <div className="nav-divider-3"></div>
                    </li>
                    <li className="mobile-margin-top-14">
                      <a href="/get-a-quote" className="button-primary-8 w-button">
                        Get a Quote
                      </a>
                    </li>
                    <li className="mobile-margin-top-14">
                      <a href="/book" className="button-primary-7 w-button">
                        Book Now
                      </a>
                    </li>
                  </ul>
                </nav>

                <div className="menu-button-5 w-nav-button">
                  <div className="w-icon-nav-menu"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- MAIN CONTENT ---------------- */}
        <div className="w-layout-vflex flex-block-362">
          <div className="w-layout-vflex flex-block-363">
            <img
              src="../images/checkmark.png"
              loading="lazy"
              alt=""
              className="image-25"
            />
            <h3 className="heading-26">Booking Confirmed!</h3>
            <h4 className="heading-27">
              Your car detailing service has been successfully booked
            </h4>
          </div>

          {/* ---- Booking Details ---- */}
          <div className="w-layout-vflex flex-block-375">
            <div className="w-layout-hflex flex-block-365">
              <h5 className="heading-28">Booking Details</h5>
              <div className="div-block-38">
                <div className="text-block-32">Confirmed</div>
              </div>
            </div>

            <div className="w-layout-vflex booking-details-wrapper">
              {/* SERVICE INFO */}
              <div className="w-layout-hflex service-info">
                <img src="../images/star.svg" className="image-26" alt="" />
                <div className="w-layout-vflex flex-block-367">
                  <div className="w-layout-vflex flex-block-368">
                    <h6 id="service-package" className="service-package">
                      {booking?.packageName || "Booking"}
                    </h6>
                    <div id="service-description" className="service-description">
                      {booking?.packageName
                        ? `${booking.packageName} deposit confirmed`
                        : "Your booking is confirmed"}
                    </div>
                  </div>

                  <ul id="service-addons" role="list" className="service-addons">
                    {addonsContent || (
                      <>
                        <li id="add-on-1">Pet Hair Removal</li>
                        <li id="add-on-2">Fabric Protection</li>
                        <li id="add-on-3">Iron Decontamination</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* DATE & TIME */}
              <div className="w-layout-hflex service-date-time">
                <img src="../images/calendar-2.svg" className="image-27" alt="" />
                <div className="w-layout-vflex">
                  <h6 id="booking-date" className="booking-date">
                    {booking?.dateLabel || "Date confirmed"}
                  </h6>
                  <div id="booking-time" className="booking-time">
                    {booking?.timeLabel || "Time confirmed"}
                  </div>
                </div>
              </div>

              {/* LOCATION */}
              <div className="w-layout-hflex service-location">
                <img src="../images/location.svg" className="image-28" alt="" />
                <div className="w-layout-vflex">
                  <h6 className="service-location-title">Service Location</h6>
                  <div id="booking-location" className="booking-location">
                    {booking?.serviceAddress || "Service address provided"}
                  </div>
                </div>
              </div>

              {/* VEHICLE */}
              <div className="w-layout-hflex vehicle-info">
                <img src="../images/car-2.svg" className="image-29" alt="" />
                <div className="w-layout-vflex">
                  <h6 id="vehicle-type" className="vehicle-type">
                    Vehicle Info
                  </h6>
                  <div id="vehicle-model" className="vehicle-model">
                    {booking?.vehicleLine || "Vehicle details provided"}
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}
              <div className="w-layout-hflex service-date-time">
                <img src="../images/calendar-2.svg" className="image-27" alt="" />
                <div className="w-layout-vflex">
                  <h6 className="booking-date">Customer</h6>
                  <ul role="list" className="list-4 w-list-unstyled">
                    <li>{booking?.customerName || "Customer"}</li>
                    <li>{booking?.email || "Email provided"}</li>
                    <li>{booking?.phone || "Phone provided"}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="w-layout-vflex flex-block-369">
              <div>Payment Summary</div>

              <div className="w-layout-vflex flex-block-371">
                <div className="w-layout-hflex booking-total-wrapper">
                  <div className="booking-summary">Service Total:</div>
                  <div id="service-total" className="service-total">
                    {booking ? formatMoney(booking.serviceTotal) : "$0.00"}
                  </div>
                </div>

                <div className="w-layout-hflex booking-total-wrapper">
                  <div className="booking-summary">Deposit Paid:</div>
                  <div id="deposit-total" className="deposit-paid">
                    {booking ? formatMoney(booking.deposit) : "$0.00"}
                  </div>
                </div>

                {booking && booking.discountAmount > 0 ? (
                  <div className="w-layout-hflex booking-total-wrapper booking-total-wrapper--discount">
                    <div className="booking-summary">
                      Discount{booking.promotionCode ? ` (${booking.promotionCode}` : ""}{booking.discountPercent ? ` ${booking.discountPercent}%` : ""}{booking.promotionCode ? ")" : ""}:
                    </div>
                    <div className="service-total">
                      - {formatMoney(booking.discountAmount)}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="w-layout-hflex flex-block-372">
                <div className="booking-summary">
                  {booking && booking.discountAmount > 0
                    ? "New Balance Due on Service Day:"
                    : "Balance Due on Service Day:"}
                </div>
                <div id="service-total" className="service-total">
                  {booking
                    ? formatMoney(
                        booking.discountAmount > 0 ? booking.discountedBalance : booking.balance
                      )
                    : "$0.00"}
                </div>
              </div>
            </div>

            {/* BOOKING REF */}
            <div className="w-layout-hflex flex-block-373">
              <div className="w-layout-vflex flex-block-374">
                <div className="text-block-36">Booking Reference</div>
                <div id="booking-reference" className="booking-reference">
                  {booking?.reference || "Generating reference..."}
                </div>
              </div>

              <img src="../images/reference.svg" width="39" alt="" />
            </div>
          </div>

          {/* IMPORTANT NOTES */}
          <div className="w-layout-vflex flex-block-375">
            <div className="text-block-37">Important Notes</div>

            <div className="w-layout-vflex flex-block-376">
              <div className="w-layout-hflex flex-block-377">
                <img src="../images/1.svg" alt="" />
                <div className="w-layout-vflex flex-block-378">
                  <div className="next-step">Confirmation Email Sent</div>
                  <div className="next-descrition">
                    Check your email for detailed booking information and receipt
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex flex-block-377">
                <img src="../images/2.svg" alt="" />
                <div className="w-layout-vflex flex-block-378">
                  <div className="next-step">24-Hour Reminder</div>
                  <div className="next-descrition">
                    We&apos;ll send you a reminder the day before your service
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex flex-block-377">
                <img src="../images/3.svg" alt="" />
                <div className="w-layout-vflex flex-block-378">
                  <div className="next-step">Service Day</div>
                  <div className="next-descrition">
                    Our team will arrive at your location on time and ready to
                    detail your vehicle
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WHAT'S NEXT */}
          <div className="w-layout-vflex flex-block-375">
            <div className="text-block-37">What&apos;s Next?</div>

            <div className="w-layout-vflex flex-block-380">
              <div className="w-layout-hflex flex-block-381">
                <img src="../images/info.svg" alt="" />
                <div className="text-block-38">
                  Please ensure your vehicle is accessible and remove all
                  personal items before our arrival
                </div>
              </div>

              <div className="w-layout-hflex flex-block-381">
                <img src="../images/clock-2.svg" alt="" />
                <div id="service-hours" className="service-hours">
                  Service duration is approximately 4 hours. You&apos;re welcome to
                  stay or we can work while you&apos;re away
                </div>
              </div>

              <div className="w-layout-hflex flex-block-381">
                <img src="../images/card.svg" alt="" />
                <div id="service-cost" className="service-cost">
                  {booking
                    ? `Remaining balance of ${formatMoney(
                        booking.discountAmount > 0 ? booking.discountedBalance : booking.balance
                      )} can be paid by cash, card, or digital payment on service day`
                    : "Remaining balance can be paid by cash, card, or digital payment on service day"}
                </div>
              </div>
            </div>
          </div>

          {/* NEED HELP */}
          <div className="w-layout-vflex flex-block-375">
            <div className="text-block-37">Need Help?</div>

            <div className="w-layout-vflex button-wrapper-6">
              <a href="/contact" className="button-6 w-button">
                Contact Us
              </a>

              <div className="w-layout-hflex flex-block-382">
                <img src="../images/contact.svg" alt="" />
                <div className="text-block-39">Contact Us</div>
              </div>
            </div>
          </div>

          {/* DOWNLOAD RECEIPT */}
          <div className="w-layout-vflex button-wrapper-7">
            <button type="button" className="button-7 w-button" onClick={handleDownloadReceipt}>
              Download Receipt
            </button>

            <div className="w-layout-hflex flex-block-382" onClick={handleDownloadReceipt} role="button" tabIndex={0}>
              <img src="../images/download2.svg" width="17" alt="" />
              <div className="text-block-40">Download Receipt</div>
            </div>
          </div>
        </div>

        {/* ---------------- FOOTER ---------------- */}
        <div className="footer">
          <div className="columns-3">
            <div className="column-13">
              <div className="title-style">
                <div className="logo-wrapper">
                  <img
                    src="../images/image-1.png"
                    loading="lazy"
                    width="86"
                    height="77"
                    alt=""
                    className="image-1"
                  />
                </div>

                <div className="text-wrapper">
                  <div className="text-59">Detail Geeks</div>
                </div>
              </div>

              <div className="join-our-newsletter-to-stay-up-to-date-on-features-and-releases">
                Join our newsletter to receive updates on features and releases.
              </div>

              <div className="actions-9">
                <div className="w-form">
                  <form
                    id="email-form"
                    name="email-form"
                    data-name="Email Form"
                    method="get"
                    className="form"
                    data-wf-page-id="6894d33fde9ebc41460da8a9"
                    data-wf-element-id="667d0597-665d-d7b2-f7b3-ffb3e825a9ab"
                  >
                    <input
                      className="text-field w-input"
                      maxLength={256}
                      name="email"
                      data-name="Email"
                      placeholder="Enter your email"
                      type="email"
                      id="email"
                      required
                    />
                    <input
                      type="submit"
                      data-wait="Please wait..."
                      className="submit-button w-button"
                      value="Subscribe"
                    />
                  </form>

                  <div className="w-form-done">
                    <div>Thank you! Your submission has been received!</div>
                  </div>

                  <div className="w-form-fail">
                    <div>Oops! Something went wrong while submitting the form.</div>
                  </div>
                </div>

                <div className="by-subscribing-you-agree-to-with-our-privacy-policy-and-provide-consent-to-receive-updates-from-our">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates from our company.
                </div>
              </div>
            </div>

            <div className="small-columns">
              <div className="column-14">
                <div className="content-style-5">
                  <div className="text-60">Quick Links</div>

                  <div className="footer-links">
                    <a href="#" className="link">
                      About Us
                    </a>

                    <div className="link-style">
                      <a href="#" className="link-2">
                        Pricing
                      </a>
                    </div>

                    <div className="link-style">
                      <a href="#" className="link-3">
                        Book Now
                      </a>
                    </div>

                    <div className="link-style">
                      <a href="#" className="link-4">
                        Get a Quote
                      </a>
                    </div>

                    <div className="link-style">
                      <a href="#" className="link-5">
                        Gallery
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="column-14">
                <div className="content-style-6">
                  <div className="text-60">Follow Us</div>

                  <div className="footer-links">
                    <div className="frame-1">
                      <img
                        src="../images/Background_3.svg"
                        loading="lazy"
                        width="19"
                        height="19"
                        alt=""
                        className="background"
                      />

                      <div className="link-style-2">
                        <a
                          href="https://www.facebook.com/share/16mRNrwCBz/?mibextid=wwXIfr"
                          className="link-6"
                        >
                          Facebook
                        </a>
                      </div>
                    </div>

                    <div className="frame-1">
                      <img
                        src="../images/Background_1.svg"
                        loading="lazy"
                        width="19"
                        height="19"
                        alt=""
                        className="background"
                      />

                      <div className="link-style-2">
                        <a
                          href="https://www.instagram.com/detailgeeksautospa?igsh=bGQ5Yzc0MXF1NjJq&utm_source=qr"
                          target="_blank"
                          className="link-7"
                        >
                          Instagram
                        </a>
                      </div>
                    </div>

                    <div className="frame-1">
                      <img
                        src="../images/Background.svg"
                        loading="lazy"
                        width="19"
                        height="19"
                        alt=""
                        className="background"
                      />

                      <div className="link-style-2">
                        <a
                          href="https://www.tiktok.com/@detailgeeksautospa?_t=ZP-8yIjhpSxQKN&_r=1"
                          className="link-14"
                        >
                          TikTok
                        </a>
                      </div>
                    </div>

                    <div className="frame-1">
                      <img
                        src="../images/Background_2.svg"
                        loading="lazy"
                        width="19"
                        height="19"
                        alt=""
                        className="background"
                      />

                      <div className="link-style-2">
                        <a
                          href="https://youtube.com/@detailgeeksautospa?si=XVqFcONLextWkHPg"
                          className="link-10"
                        >
                          YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="credits">
            <img
              src="../images/Divider.svg"
              loading="lazy"
              width="1312"
              height="1"
              alt=""
              className="divider"
            />

            <div className="row">
              <div className="link-style-2">
                © 2025 Detail Geeks Auto Spa. All rights reserved.
              </div>

              <div className="title-style">
                <div className="text-61">
                  <a href="privacy-policy" className="link-11">
                    Privacy Policy
                  </a>
                </div>
                <div className="text-61">
                  <a href="terms-of-service" className="link-12">
                    Terms of Service
                  </a>
                </div>
                <div className="text-61">
                  <a href="#" className="link-13">
                    Cookies Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Script
          src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=685051eff25b20ed7a72c744"
          strategy="afterInteractive"
        />
        <Script src="../js/webflow.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
