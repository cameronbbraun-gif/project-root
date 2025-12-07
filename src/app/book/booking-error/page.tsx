/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Head from "next/head";

export default function BookingError() {
  return (
    <>
      <Head>
        <title>Booking error</title>
        <meta property="og:title" content="Booking error" />
        <meta property="twitter:title" content="Booking error" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="../css/normalize.css" rel="stylesheet" />
        <link href="../css/webflow.css" rel="stylesheet" />
        <link href="../css/style.css" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
          defer
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              WebFont.load({
                google: {
                  families: ["Outfit:100,200,300,400,500,600,700,800,900","Roboto:100,200,300,400,500,600,700,800,900,100italic,200italic,300italic,italic,500italic,600italic,700italic,800italic,900italic"]
                }
              });
            `
          }}
        />
        <link href="../images/favicon.png" rel="shortcut icon" />
        <link href="../images/webclip.png" rel="apple-touch-icon" />
      </Head>

      <body>
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
                <a href="#" className="navbar-brand-5 w-nav-brand">
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
                </a>

                <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
                  <ul className="nav-menu-two-3 w-list-unstyled">
                    <li>
                      <a href="../index.html" className="nav-link-4">
                        Home
                      </a>
                    </li>
                    <li className="list-item">
                      <a href="about-us.html" className="nav-link-4">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="pricing.html" className="nav-link-4">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="contact.html" className="nav-link-4">
                        Contact
                      </a>
                    </li>
                    <li>
                      <div className="nav-divider-3"></div>
                    </li>
                    <li className="mobile-margin-top-14">
                      <a href="get-a-quote.html" className="button-primary-8 w-button">
                        Get a Quote
                      </a>
                    </li>
                    <li className="mobile-margin-top-14">
                      <a href="book.html" className="button-primary-7 w-button">
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

        <div className="w-layout-vflex flex-block-362">
          <div className="w-layout-vflex flex-block-363">
            <img src="../images/fail.svg" loading="lazy" alt="" />
            <h3 className="heading-26">Booking Failed!</h3>
            <h4 className="heading-27">
              Your booking could not be completed because the payment did not go through
            </h4>
          </div>

          <div className="w-layout-vflex flex-block-375">
            <div className="w-layout-hflex flex-block-365">
              <h5 className="heading-28">Booking Details</h5>
              <div className="div-block-38">
                <div className="text-block-32">Failed</div>
              </div>
            </div>

            <div className="w-layout-vflex booking-details-wrapper">
              <div className="w-layout-hflex service-info">
                <img src="../images/star.svg" loading="lazy" alt="" className="image-26" />

                <div className="w-layout-vflex flex-block-367">
                  <div className="w-layout-vflex flex-block-368">
                    <h6 id="service-package" className="service-package">
                      Premium Full Detail
                    </h6>
                    <div id="service-description" className="service-description">
                      Complete interior & exterior detailing
                    </div>
                  </div>

                  <ul id="service-addons" className="service-addons">
                    <li id="add-on-1">Pet Hair Removal</li>
                    <li id="add-on-2">Fabric Protection</li>
                    <li id="add-on-3">Iron Decontamination</li>
                  </ul>
                </div>
              </div>

              <div className="w-layout-hflex service-date-time">
                <img src="../images/calendar-2.svg" loading="lazy" alt="" className="image-27" />
                <div className="w-layout-vflex">
                  <h6 id="booking-date" className="booking-date">
                    January 15, 2025
                  </h6>
                  <div id="booking-time" className="booking-time">
                    Tuesday at 9:00 AM - 1:00 PM (4 hours)
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex service-location">
                <img src="../images/location.svg" loading="lazy" alt="" className="image-28" />
                <div className="w-layout-vflex">
                  <h6 className="service-location-title">Service Location</h6>
                  <div id="booking-location" className="booking-location">
                    123 Main Street Los Angeles, CA 90210
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex vehicle-info">
                <img src="../images/car-2.svg" loading="lazy" alt="" className="image-29" />
                <div className="w-layout-vflex">
                  <h6 id="vehicle-type" className="vehicle-type">
                    Vehicle (Sedan)
                  </h6>
                  <div id="vehicle-model" className="vehicle-model">
                    2022 Honda Accord
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex service-date-time">
                <img src="../images/calendar-2.svg" loading="lazy" alt="" className="image-27" />
                <div className="w-layout-vflex">
                  <h6 className="booking-date">Customer</h6>
                  <ul className="list-4 w-list-unstyled">
                    <li>John Smith</li>
                    <li>john.smith@email.com</li>
                    <li>(555) 123-4567</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="w-layout-vflex flex-block-375">
            <div className="text-block-37">Important Notes</div>
            <div className="w-layout-vflex flex-block-376">
              <ul className="list-5">
                <li>Verify your card number, expiration date, and CVV code are correct</li>
                <li>Ensure your billing address matches your card's registered address</li>
                <li>Check that you have sufficient funds or credit available</li>
                <li>Contact your bank if the card has been temporarily blocked</li>
              </ul>
            </div>
          </div>

          <div className="w-layout-vflex flex-block-375">
            <div className="text-block-37">Need Help?</div>
            <div className="w-layout-vflex button-wrapper-6">
              <a href="contact.html" className="button-6 w-button">
                Contact Us
              </a>
              <div className="w-layout-hflex flex-block-382">
                <img src="../images/contact.svg" loading="lazy" alt="" />
                <div className="text-block-39">Contact Us</div>
              </div>
            </div>
          </div>

          <div className="w-layout-vflex button-wrapper-7">
            <a href="#" className="button-8 w-button">
              Download Receipt
            </a>
            <div className="w-layout-hflex flex-block-382">
              <img src="../images/back2.svg" loading="lazy" alt="" />
              <div className="text-block-40">Back to Checkout</div>
            </div>
          </div>
        </div>

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
                  <form className="form">
                    <input
                      className="text-field w-input"
                      maxLength={256}
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      required
                    />
                    <input
                      type="submit"
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
                  By subscribing, you agree to our Privacy Policy and consent to receive updates
                  from our company.
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
                  <a href="privacy-policy.html" className="link-11">
                    Privacy Policy
                  </a>
                </div>
                <div className="text-61">
                  <a href="terms-of-service.html" className="link-12">
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
      </body>
    </>
  );
}