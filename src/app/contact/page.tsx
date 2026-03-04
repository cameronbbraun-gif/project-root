/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { initContactForm } from "./contact";

export default function ContactPage() {
  const recaptchaSiteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    initContactForm({ recaptchaSiteKey });
  }, [recaptchaSiteKey]);

  useEffect(() => {
    let active = true;

    const loadCsrfToken = async () => {
      try {
        const res = await fetch("/api/contact/csrf", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!res.ok) {
          throw new Error(`CSRF init failed (${res.status})`);
        }

        const payload = await res.json();
        if (active) {
          setCsrfToken(typeof payload?.csrfToken === "string" ? payload.csrfToken : "");
        }
      } catch (error) {
        console.error("[contact] csrf init failed:", error);
        if (active) {
          setCsrfToken("");
        }
      }
    };

    void loadCsrfToken();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {recaptchaSiteKey ? (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => {
            initContactForm({ recaptchaSiteKey });
          }}
        />
      ) : null}
      <main>
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
                  <img src="/images/logo.png" loading="lazy" width="92" alt="" className="image-13" />
                  <h1 className="heading-3">Detail Geeks</h1>
                </Link>

                <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
                  <ul role="list" className="nav-menu-two-3 w-list-unstyled">
                    <li><Link href="/" className="nav-link-4">Home</Link></li>
                    <li><a href="/about-us" className="nav-link-4">About Us</a></li>
                    <li><a href="/pricing" className="nav-link-4">Pricing</a></li>
                    <li><a href="/contact" className="nav-link-4 w--current">Contact</a></li>
                    <li><div className="nav-divider-3"></div></li>
                    <li><a href="/get-a-quote" className="button-primary-8 w-button">Get a Quote</a></li>
                    <li><a href="/book" className="button-primary-7 w-button">Book Now</a></li>
                  </ul>
                </nav>

                <div className="menu-button-5 w-nav-button">
                  <div className="w-icon-nav-menu"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT SECTION */}
        <div className="contact-form-2">
          <div className="content-style-17">
            <div className="container-22">
              <div className="section-title-4">
                <h2 className="get-in-touch-2">Contact Us</h2>
                <div className="text-92">
                  We'd love to hear from you! Reach out with any questions
                  or to schedule your mobile car detailing service today.
                </div>
              </div>

              <div className="form-wrapper-2 w-form">
                <form
                  id="contact-form"
                  method="post"
                  action="/api/contact"
                  className="form-style-3"
                >
                  <div className="input">
                    <div className="input-wrapper">
                      <label htmlFor="first-name" className="form-block-label">First Name</label>
                      <input className="form-text-input w-input" name="first_name" id="first-name" type="text" required />
                    </div>

                    <div className="input-wrapper">
                      <label htmlFor="last-name" className="form-block-label">Last Name</label>
                      <input className="form-text-input w-input" name="last_name" id="last-name" type="text" required />
                    </div>
                  </div>

                  <div className="input-wrapper-2">
                    <label htmlFor="email" className="form-block-label-2">Email</label>
                    <input className="form-text-input-2 w-input" name="email" id="email" type="email" required />
                  </div>

                  <div className="textarea-wrapper-3">
                    <label htmlFor="message" className="form-block-label-2">Message</label>
                    <textarea className="form-textarea-2 w-input" id="message" name="message" placeholder="Share your thoughts..." required />
                  </div>

                  <input type="hidden" name="csrf_token" value={csrfToken} readOnly />

                  <div className="contact-honeypot" aria-hidden="true">
                    <label htmlFor="website" className="form-block-label-2">Website</label>
                    <input
                      className="form-text-input-2 w-input"
                      name="website"
                      id="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="w-checkbox checkbox-field contact-checkbox-field">
                    <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-2"></div>
                    <input type="checkbox" name="terms" id="terms" required style={{ opacity: 0, position: "absolute", zIndex: -1 }} />
                    <label className="checkbox-label w-form-label contact-checkbox-label" htmlFor="terms">
                      I agree to <a href="/terms-of-service" className="link-15">Terms</a> and <a href="/privacy-policy" className="link-15">Privacy Policy</a>
                    </label>
                  </div>

                  {recaptchaSiteKey ? (
                    <div className="contact-recaptcha" style={{ marginTop: 16, marginBottom: 20 }}>
                      <div id="contact-recaptcha" className="contact-recaptcha-widget"></div>
                    </div>
                  ) : null}

                  <input type="submit" className="submit-button-2 w-button" value="Send" />
                </form>

                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>

                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>

            <img
              src="/images/jan-vlacuha-U4IaoKF5aj4-unsplash-2-1.png"
              loading="lazy"
              width="357"
              alt=""
              className="jan-vlacuha-u4iaokf5aj4-unsplash-2-1"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <div className="columns-3">
            <div className="column-13">
              <div className="title-style">
                <div className="logo-wrapper">
                  <img src="/images/image-1.png" loading="lazy" width="86" alt="" className="image-1" />
                </div>
                <div className="text-wrapper">
                  <div className="text-59">Detail Geeks</div>
                </div>
              </div>

              <div className="join-our-newsletter-to-stay-up-to-date-on-features-and-releases">
                Join our newsletter for updates on features and releases.
              </div>

              <form className="form">
                <input className="text-field w-input" name="email" placeholder="Enter your email" type="email" required />
                <input type="submit" className="submit-button w-button" value="Subscribe" />
              </form>

              <div className="by-subscribing-you-agree-to-with-our-privacy-policy-and-provide-consent-to-receive-updates-from-our">
                By subscribing, you agree to our Privacy Policy.
              </div>
            </div>

            <div className="small-columns">
              <div className="column-14">
                <div className="content-style-5">
                  <div className="text-60">Quick Links</div>
                  <div className="footer-links">
                    <a href="/about-us" className="link">About Us</a>
                    <a href="/pricing" className="link">Pricing</a>
                    <a href="/book" className="link">Book Now</a>
                    <a href="/get-a-quote" className="link">Get a Quote</a>
                    <a href="/gallery" className="link">Gallery</a>
                  </div>
                </div>
              </div>

              <div className="column-14">
                <div className="content-style-6">
                  <div className="text-60">Follow Us</div>
                  <div className="footer-links">
                    <a href="https://www.facebook.com/share/16mRNrwCBz/?mibextid=wwXIfr" className="link-6">Facebook</a>
                    <a href="https://www.instagram.com/detailgeeksautospa" className="link-7">Instagram</a>
                    <a href="https://www.tiktok.com/@detailgeeksautospa" className="link-14">TikTok</a>
                    <a href="https://youtube.com/@detailgeeksautospa" className="link-10">YouTube</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <img src="/images/Divider.svg" alt="" className="divider" />

          <div className="row">
            <div className="link-style-2">© 2025 Detail Geeks Auto Spa. All rights reserved.</div>
            <div className="title-style">
              <a href="/privacy-policy" className="link-11">Privacy Policy</a>
              <a href="/terms-of-service" className="link-12">Terms of Service</a>
              <a href="#" className="link-13">Cookies Settings</a>
            </div>
          </div>
        </div>
      </main>
      <style jsx global>{`
        .contact-form-2,
        .contact-form-2 .container-22,
        .contact-form-2 .form-wrapper-2,
        .contact-form-2 .form-style-3,
        .contact-form-2 .textarea-wrapper-3 {
          height: auto;
        }

        .contact-form-2 .contact-checkbox-field {
          align-items: flex-start;
        }

        .contact-form-2 .contact-honeypot {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .contact-form-2 .contact-checkbox-label {
          width: auto;
          flex: 1;
          line-height: 1.5;
        }

        .contact-form-2 .contact-recaptcha,
        .contact-form-2 .submit-button-2 {
          width: 100%;
          max-width: 616px;
        }

        .contact-form-2 .submit-button-2 {
          box-sizing: border-box;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .contact-form-2 .submit-button-2:hover {
          background-color: #32343a;
        }

        .contact-form-2 .submit-button-2:active {
          background-color: #43464d;
        }

        .contact-form-2 .submit-button-2:disabled {
          background-color: #32343a;
          cursor: wait;
          opacity: 1;
        }

        @media screen and (max-width: 767px) {
          .contact-form-2 .input {
            max-width: 100%;
          }

          .contact-form-2 .input-wrapper,
          .contact-form-2 .form-text-input,
          .contact-form-2 .input-wrapper-2,
          .contact-form-2 .form-text-input-2,
          .contact-form-2 .textarea-wrapper-3,
          .contact-form-2 .form-textarea-2 {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}
