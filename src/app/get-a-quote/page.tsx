"use client";

import { useEffect } from "react";
import "./quote.css";

export default function GetAQuotePage() {
    useEffect(() => {
        import("./quote");
      }, []);
  return (
    <>
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
                  src="/images/logo.png"
                  loading="lazy"
                  width="92"
                  sizes="92px"
                  alt=""
                  className="image-13"
                />
                <h1 className="heading-3">Detail Geeks</h1>
              </a>
              <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
                <ul role="list" className="nav-menu-two-3 w-list-unstyled">
                  <li>
                    <a href="/" className="nav-link-4">Home</a>
                  </li>
                  <li className="list-item">
                    <a href="/about-us" className="nav-link-4">About Us</a>
                  </li>
                  <li>
                    <a href="/pricing" className="nav-link-4">Pricing</a>
                  </li>
                  <li>
                    <a href="/contact" className="nav-link-4">Contact</a>
                  </li>
                  <li><div className="nav-divider-3"></div></li>
                  <li className="mobile-margin-top-14">
                    <a href="/get-a-quote" aria-current="page" className="button-primary-8 w-button w--current">
                      Get a Quote
                    </a>
                  </li>
                  <li className="mobile-margin-top-14">
                    <a href="/book" className="button-primary-7 w-button">Book Now</a>
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

      <div className="hero-stack-3">
        <div className="div-block-25"></div>
        <div className="div-block-26"></div>
        <div className="small-container-4">
          <div className="title-section-8">
            <div className="text-96">Get a Quote</div>
            <div className="text-97">
              Easily request a quote by providing details about your vehicle and desired services.
            </div>
          </div>
        </div>
      </div>

      <div className="contact-form-4">
        <div className="container-25">
          <div className="form-wrapper-4 w-form">
            <form
              id="quote-form"
              name="quote-form"
              method="post"
              action="/api/quote"
              encType="multipart/form-data"
              className="form-style-5"
              noValidate
            >
              <div className="input-5">
                <div className="input-wrapper-5">
                  <label htmlFor="first_name" className="form-block-label-3">First Name</label>
                  <input
                    className="form-text-input-3 w-input"
                    maxLength={256}
                    name="first_name"
                    id="first_name"
                    type="text"
                    required
                  />
                </div>
                <div className="input-wrapper-5">
                  <label htmlFor="last_name" className="form-block-label-3">Last Name</label>
                  <input
                    className="form-text-input-3 w-input"
                    maxLength={256}
                    name="last_name"
                    id="last_name"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="input-5">
                <div className="input-wrapper-5">
                  <label htmlFor="email" className="form-block-label-3">Email</label>
                  <input
                    className="form-text-input-3 w-input"
                    maxLength={256}
                    name="email"
                    id="email"
                    type="email"
                    required
                  />
                </div>
                <div className="input-wrapper-5">
                  <label htmlFor="phone" className="form-block-label-3">Phone Number</label>
                  <input
                    className="form-text-input-3 w-input"
                    maxLength={20}
                    name="phone"
                    id="phone"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <div className="frame-10">
                <div className="text-103">Select Your Vehicle Type</div>
                <div className="w-layout-hflex flex-block-9">
                  <label className="radio-button-field w-radio">
                    <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input" />
                    <input
                      type="radio"
                      name="vehicle_type"
                      id="vehicle_type_sedan"
                      value="Sedan"
                      required
                      style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                    />
                    <img src="/images/sedan.svg" loading="lazy" width="109" alt="" className="image-15" />
                    <span className="radio-button-label w-form-label">Sedan</span>
                  </label>

                  <label className="radio-button-field w-radio">
                    <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input" />
                    <input
                      type="radio"
                      name="vehicle_type"
                      id="vehicle_type_suv"
                      value="SUV"
                      required
                      style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                    />
                    <img src="/images/suv.svg" loading="lazy" width="109" alt="" className="image-16" />
                    <span className="radio-button-label w-form-label">SUV</span>
                  </label>

                  <label className="radio-button-field w-radio">
                    <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button w-radio-input" />
                    <input
                      type="radio"
                      name="vehicle_type"
                      id="vehicle_type_truck"
                      value="Large SUV/Truck"
                      required
                      style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                    />
                    <img src="/images/truck.svg" loading="lazy" width="111" alt="" className="image-17" />
                    <span className="radio-button-label w-form-label">Large SUV/Truck</span>
                  </label>
                </div>
              </div>

              <div className="input-6">
                <div className="input-wrapper-6">
                  <label htmlFor="vehicle_make" className="form-block-label-3">Make</label>
                  <input className="form-text-input-5 w-input" name="vehicle_make" id="vehicle_make" type="text" required />
                </div>
                <div className="input-wrapper-6">
                  <label htmlFor="vehicle_model" className="form-block-label-3">Model</label>
                  <input className="form-text-input-5 w-input" name="vehicle_model" id="vehicle_model" type="text" required />
                </div>
                <div className="input-wrapper-6">
                  <label htmlFor="vehicle_year" className="form-block-label-3">Year</label>
                  <input
                    className="form-text-input-5 w-input"
                    name="vehicle_year"
                    id="vehicle_year"
                    type="number"
                    min={1980}
                    max={2026}
                    required
                  />
                </div>
              </div>

              <label htmlFor="service" className="form-block-label-3" style={{ marginTop: "12px" }}>
                Desired Service
              </label>

              <select id="service" name="service" required className="select-field w-select">
                <option value="">Select one...</option>
                <option value="Quick Exterior">Quick Exterior</option>
                <option value="Full Exterior">Full Exterior</option>
                <option value="Quick Interior">Quick Interior</option>
                <option value="Full Interior">Full Interior</option>
                <option value="Maintenance Detail">Maintenance Detail</option>
                <option value="Show Room Detail">Show Room Detail</option>
                <option value="I&apos;m not sure">I&apos;m not sure</option>              </select>

              <div className="frame-11">
                <div className="message">Upload Photos of Your Vehicle</div>
                <div className="text-104">**Requirements**</div>

                <div className="content-style-19">
                  <div className="text-105">Please include:</div>
                  <div className="list">
                    <div className="text-105">Exterior (Front, back, left, and right sides)</div>
                    <div className="text-105">All 4 tires</div>
                    <div className="text-105">Interior (front seats, rear seats, floor, and trunk)</div>
                  </div>
                </div>
              </div>

              <div className="input-7">
                <div id="upload-dropzone" className="upload-dropzone">
                  <img src="/images/upload-icon.svg" alt="" className="upload-icon" />
                  <div className="upload-help">Drag the file here or click the button below</div>
                  <button type="button" className="upload-btn">Upload File</button>
                </div>

                <input id="photos" name="photos" type="file" accept="image/*" multiple hidden />
                <input type="hidden" name="upload_batch" id="upload_batch" />
                <ul id="upload-list" className="upload-list" aria-live="polite"></ul>
              </div>

              <div className="textarea-wrapper-4">
                <label htmlFor="message" className="form-block-label-3">Message</label>
                <textarea
                  placeholder="Write your message..."
                  maxLength={5000}
                  id="message"
                  name="message"
                  className="form-textarea-3 w-input"
                ></textarea>
              </div>

              <div className="selectedfalse-alternatefalse">
                <label className="w-checkbox checkbox-field">
                  <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-2"></div>
                  <input
                    type="checkbox"
                    name="agree_to_terms"
                    id="agree_to_terms"
                    required
                    style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                  />
                  <span className="checkbox-label w-form-label">
                    I agree to <a href="/terms-of-service" className="link-15">Terms</a>
                  </span>
                </label>
              </div>

              <input
                id="submit-quote"
                type="submit"
                data-wait="Please wait..."
                className="form-button-2 w-button"
                value="Send"
              />
            </form>

            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>

            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
}