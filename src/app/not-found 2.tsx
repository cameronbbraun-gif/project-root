/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main>
      {/* NAVBAR */}
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
                  src="/images/logo.png"
                  loading="lazy"
                  width="92"
                  alt=""
                  className="image-13"
                />
                <h1 className="heading-3">Detail Geeks</h1>
              </Link>

              <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
                <ul role="list" className="nav-menu-two-3 w-list-unstyled">
                  <li><Link href="/" className="nav-link-4">Home</Link></li>
                  <li><a href="/about-us" className="nav-link-4">About Us</a></li>
                  <li><a href="/pricing" className="nav-link-4">Pricing</a></li>
                  <li><a href="/contact" className="nav-link-4">Contact</a></li>
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

      {/* 404 SECTION */}
      <div className="hero-heading-left-13">
        <div className="container-29">
          <div className="column-26">
            <h1 className="title-copy-goes-here-be-awesome-42">404 - Page Not Found</h1>
            <p className="lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-suspendisse-varius-enim-in-eros-elementum-tri-10">
              Oops! The page you are looking for doesn't exist.  
              Please check the URL or return to the homepage.
            </p>

            <div className="column-27">
              <div className="actions-15">
                <Link href="/" className="button-style-25">
                  <div className="text-111">Home</div>
                </Link>
              </div>
              <div className="actions-15">
                <a href="/contact" className="button-style-26">
                  <div className="text-111">Contact</div>
                </a>
              </div>
            </div>
          </div>

          <div className="column-28">
            <div className="image-wrapper-12">
              <img
                src="/images/AdobeStock_543927925-2.png"
                loading="lazy"
                width="748"
                height="600"
                alt=""
                className="adobestock_543927925-5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT CARDS */}
      <div className="team-circles-6">
        <div className="container-30">
          <div className="columns-10">

            <div className="card-6">
              <div className="image-wrapper-13">
                <img src="/images/mail.svg" width="62" alt="Email" />
              </div>
              <div className="content-style-21">
                <div className="info-7">
                  <div className="text-112">Email</div>
                  <div className="text-113">For any inquiries, reach out:</div>
                </div>
                <div className="description-8">info@yourbusiness.com</div>
              </div>
            </div>

            <div className="card-6">
              <div className="image-wrapper-13">
                <img src="/images/call.svg" alt="Phone" />
              </div>
              <div className="content-style-21">
                <div className="info-7">
                  <div className="text-112">Phone</div>
                  <div className="text-113">
                    We're here to assist with any questions.
                  </div>
                </div>
                <div className="description-8">+1 (813) 838-3560</div>
              </div>
            </div>

            <div className="card-6">
              <div className="image-wrapper-13">
                <img src="/images/Text.svg" alt="Text" />
              </div>
              <div className="content-style-21">
                <div className="info-7">
                  <div className="text-112">Text</div>
                  <div className="text-113">Text us anytime:</div>
                </div>
                <div className="description-8">+1 (813) 838-3560</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="columns-3">
          <div className="column-13">
            <div className="title-style">
              <div className="logo-wrapper">
                <img src="/images/image-1.png" width="86" alt="" className="image-1" />
              </div>
              <div className="text-wrapper">
                <div className="text-59">Detail Geeks</div>
              </div>
            </div>

            <div className="join-our-newsletter-to-stay-up-to-date-on-features-and-releases">
              Join our newsletter for updates and releases.
            </div>

            <form className="form">
              <input className="text-field w-input" placeholder="Enter your email" type="email" required />
              <input className="submit-button w-button" type="submit" value="Subscribe" />
            </form>

            <div className="by-subscribing-you-agree-to">
              By subscribing, you agree to our Privacy Policy.
            </div>
          </div>

          <div className="small-columns">
            <div className="column-14">
              <div className="content-style-5">
                <div className="text-60">Quick Links</div>
                <div className="footer-links">
                  <a href="/about-us" className="link">About Us</a>
                  <a href="/pricing" className="link-2">Pricing</a>
                  <a href="/book" className="link-3">Book Now</a>
                  <a href="/get-a-quote" className="link-4">Get a Quote</a>
                  <a href="/gallery" className="link-5">Gallery</a>
                </div>
              </div>
            </div>

            <div className="column-14">
              <div className="content-style-6">
                <div className="text-60">Follow Us</div>
                <div className="footer-links">
                  <a href="https://facebook.com" className="link-6">Facebook</a>
                  <a href="https://instagram.com" className="link-7">Instagram</a>
                  <a href="https://tiktok.com" className="link-14">TikTok</a>
                  <a href="https://youtube.com" className="link-10">YouTube</a>
                </div>
              </div>
            </div>

          </div>
        </div>

        <img src="/images/Divider.svg" alt="" className="divider" />

        <div className="row">
          <div className="link-style-2">
            © 2025 Detail Geeks Auto Spa. All rights reserved.
          </div>
          <div className="title-style">
            <a href="/privacy-policy" className="link-11">Privacy Policy</a>
            <a href="/terms-of-service" className="link-12">Terms of Service</a>
            <a href="#" className="link-13">Cookies Settings</a>
          </div>
        </div>
      </div>
    </main>
  );
}
