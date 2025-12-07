/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";

import { initBookingSystem } from "./book";



export default function BookingPage() {
  useEffect(() => {
    const loader = () => {
      if ((window as Window & { WebFont?: { load: (config: { google: { families: string[] }}) => void } }).WebFont) {
        (window as Window & { WebFont?: { load: (config: { google: { families: string[] }}) => void } }).WebFont?.load({
          google: {
            families: [
              "Outfit:100,200,300,regular,500,600,700,800,900",
              "Roboto:100,200,300,regular,500,600,700,800,900,italic"
            ]
          }
        });
      }
    };

    if (!(window as Window & { WebFont?: { load: (config: { google: { families: string[] }}) => void } }).WebFont) {
      (window as Window & { __webfontLoad?: () => void }).__webfontLoad = loader;
    } else {
      loader();
    }
  }, []);
  useEffect(() => {
    initBookingSystem();
  }, []);

  useEffect(() => {
    // Set page title and meta tags
    document.title = "Book Now";
    
    // Set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMetaTag("og:title", "Book Now", true);
    setMetaTag("twitter:title", "Book Now", true);
    
    // Add stylesheet if not already present
    if (!document.querySelector('link[href="/book.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/book.css";
      document.head.appendChild(link);
    }
  }, []);

    return (
      <>

      <Script
        src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
        strategy="afterInteractive"
        onLoad={() => {
          const w = window as Window & { WebFont?: { load: (config: { google: { families: string[] }}) => void } };
          if (w.WebFont && typeof w.WebFont.load === "function") {
            w.WebFont.load({
              google: {
                families: [
                  "Outfit:100,200,300,regular,500,600,700,800,900",
                  "Roboto:100,200,300,regular,500,600,700,800,900,italic"
                ]
              }
            });
          }
        }}
      />


      <Script src="https://js.stripe.com/v3/" />

      <Script id="dg-vars">{`
        window.DG_SERVICE_CENTER_LAT = 28.209820080280995;
        window.DG_SERVICE_CENTER_LNG = -82.35380942519879;
        window.DG_GMAPS_API_KEY = "AIzaSyAzyJG-JChx9PvBU4u9cMTmssx7CwIjz0g";
      `}</Script>
      
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
                    sizes="91.985px"
                    alt=""
                    className="image-13"
                  />
                  <h1 className="heading-3">Detail Geeks</h1>
                </a>
                <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
                  <ul className="nav-menu-two-3 w-list-unstyled">
                    <li><Link href="/index.html" className="nav-link-4">Home</Link></li>
                    <li><Link href="/about-us.html" className="nav-link-4">About Us</Link></li>
                    <li><Link href="/pricing.html" className="nav-link-4">Pricing</Link></li>
                    <li><Link href="/contact.html" className="nav-link-4">Contact</Link></li>

                    <li><div className="nav-divider-3" /></li>

                    <li className="mobile-margin-top-14">
                      <Link href="/get-a-quote.html" className="button-primary-8 w-button">
                        Get a Quote
                      </Link>
                    </li>

                    <li className="mobile-margin-top-14">
                      <Link href="/book.html" className="button-primary-7 w-button w--current">
                        Book Now
                      </Link>
                    </li>
                  </ul>
                </nav>
                <div className="menu-button-5 w-nav-button">
                  <div className="w-icon-nav-menu" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-no-image-2">
          <div className="small-container-5">
            <div className="content-style-22">
              <div className="text-114">Booking</div>
              <div className="text-115">Your Easy Booking Process Starts Here</div>
              <div className="text-116">
                Booking your mobile car detailing service is quick and
                straightforward. Just follow the steps outlined below to secure
                your appointment.
              </div>
            </div>
          </div>
        </div>
                <div className="hero-stack-4">
          <div className="form-block w-form">
            <div className="w-embed">
              <input type="hidden" id="selectedDate" name="selectedDate" />
            </div>
            <div className="w-embed">
              <input type="hidden" id="selectedTime" name="selectedTime" />
            </div>

            <div className="w-layout-vflex flex-block-13">
              <h3 className="heading-6">Book Your Detail Service</h3>

              <div className="w-layout-hflex flex-block-14">
                <div className="w-layout-vflex flex-block-15">
                  <div className="div-block-28 progress-step" data-step="1">
                    <p className="paragraph-2">1</p>
                  </div>
                  <h4 className="heading-7 progress-label">Vehicle</h4>
                </div>

                <div className="div-block-29 progress-connector" data-to="2" />

                <div className="w-layout-vflex flex-block-15">
                  <div className="div-block-30 progress-step" data-step="2">
                    <p className="paragraph-3">2</p>
                  </div>
                  <h4 className="heading-8 progress-label">Services</h4>
                </div>

                <div className="div-block-31 progress-connector" data-to="3" />

                <div className="w-layout-vflex flex-block-15">
                  <div className="div-block-32 progress-step" data-step="3">
                    <p className="paragraph-4">3</p>
                  </div>
                  <h4 className="heading-9 progress-label">Date/Time</h4>
                </div>

                <div className="div-block-33 progress-connector" data-to="4" />

                <div className="w-layout-vflex flex-block-15">
                  <div className="div-block-34 progress-step" data-step="4">
                    <p className="paragraph-5">4</p>
                  </div>
                  <h4 className="heading-10 progress-label">Info</h4>
                </div>

                <div className="div-block-35 progress-connector" data-to="5" />

                <div className="w-layout-vflex flex-block-15">
                  <div className="div-block-36 progress-step" data-step="5">
                    <p className="paragraph-6">5</p>
                  </div>
                  <h4 className="heading-11 progress-label">Payment</h4>
                </div>
              </div>
            </div>

            <form
              id="wf-form-Name-Form"
              name="wf-form-Name-Form"
              data-name="Name Form"
              method="get"
              autoComplete="off"
              className="form-2"
            >
              <div
                className="w-layout-vflex flex-block-16 form-step is-active"
                data-step="1"
                id="step-1"
                role="region"
                aria-labelledby="step-1-label"
              >
                <h4 className="heading-12" id="step-1-label">
                  Vehicle Information
                </h4>
                <h5 className="heading-13">
                  Please provide details about your vehicle
                </h5>

                <div className="w-layout-vflex flex-block-17">
                  <label htmlFor="vehicle-type" className="field-label-2">
                    Vehicle Type *
                  </label>
                  <select
                    id="vehicle-type"
                    name="vehicle-type"
                    className="select-field-2 w-select"
                    required
                  >
                    <option value="">Select one...</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Large SUV/Truck</option>
                  </select>
                </div>

                <div className="w-layout-hflex flex-block-18">
                  <div className="w-layout-vflex flex-block-17">
                    <label htmlFor="vehicle-make" className="field-label-2">
                      Make *
                    </label>
                    <input
                      className="text-field-2 w-input"
                      maxLength={256}
                      name="vehicle_make"
                      id="vehicle-make"
                      type="text"
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="w-layout-vflex flex-block-17">
                    <label htmlFor="vehicle-model" className="field-label-2">
                      Model *
                    </label>
                    <input
                      className="text-field-2 w-input"
                      maxLength={256}
                      name="vehicle_model"
                      id="vehicle-model"
                      type="text"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="w-layout-hflex flex-block-18">
                  <div className="w-layout-vflex flex-block-17">
                    <label htmlFor="vehicle-year" className="field-label-2">
                      Year *
                    </label>
                    <input
                      className="text-field-2 w-input"
                      maxLength={4}
                      name="vehicle_year"
                      id="vehicle-year"
                      type="text"
                      pattern="\d*"
                      required
                    />
                  </div>

                  <div className="w-layout-vflex flex-block-17">
                    <label htmlFor="vehicle-color" className="field-label-2">
                      Color *
                    </label>
                    <input
                      className="text-field-2 w-input"
                      maxLength={256}
                      name="vehicle_color"
                      id="vehicle-color"
                      type="text"
                      required
                    />
                  </div>
                </div>
                <div className="w-layout-hflex flex-block-19">
                  <a href="#" className="nextbutton w-inline-block" data-next>
                    <div className="nexttext">Next</div>
                    <img src="/images/next.svg" className="nextarrow" />
                  </a>
                </div>
              </div> {/* closes flex-block-16 */}

              <div
                className="w-layout-vflex flex-block-20 form-step"
                data-step="2"
                id="step-2"
                role="region"
                aria-labelledby="step-2-label"
              >
                <h4 className="heading-12" id="step-2-label">
                  Service Selection
                </h4>
                <h5 className="heading-13">
                  Choose your detail package and any add-ons
                </h5>

                <div className="w-layout-vflex flex-block-21">
                  <h5 className="heading-14">Detail Packages</h5>

                  <div className="w-layout-vflex flex-block-328">
                    <label className="radio-button-field-2 w-radio">
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-2 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Quick Exterior"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-24">
                        <h6 className="heading-15">Quick Exterior</h6>
                        <h6 className="heading-16" data-price-key="quickExterior">
                          $49
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Light exterior wash and shine for routine upkeep.
                        </div>
                        <div className="w-layout-vflex flex-block-25">
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Foam cannon bath</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">2-bucket hand wash</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Wheel cleaning</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Tire shine dressing</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Windows cleaned inside/out
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 1–2 hours</h6>
                    </label>
                    <label className="radio-button-field-2 w-radio">
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-2 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Full Exterior"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-28">
                        <h6 className="heading-15">Full Exterior</h6>
                        <h6 className="heading-16" data-price-key="fullExterior">
                          $99
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Comprehensive exterior cleaning, decontamination, and
                          protection.
                        </div>
                        <div className="w-layout-vflex flex-block-25">
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Everything in Quick Exterior
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              4–6 month wax application
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Bug and tar removal</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Trim restoration</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Clay bar decontamination
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 2–3 hours</h6>
                    </label>
                    <label className="radio-button-field-2 w-radio">
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-2 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Quick Interior"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-29">
                        <h6 className="heading-15">Quick Interior</h6>
                        <h6 className="heading-16" data-price-key="quickInterior">
                          $59
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Maintenance interior cleaning for recently detailed vehicles
                        </div>
                        <div className="w-layout-vflex flex-block-25">
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Full Interior Vacuum</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Windows cleaned inside/out</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Clean door jambs</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Interior dusted</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Plastics wiped down and cleaned
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 1–2 hours</h6>
                    </label>
                    <label className="radio-button-field-2 w-radio">
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-2 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Full Interior"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-30">
                        <h6 className="heading-15">Full Interior</h6>
                        <h6 className="heading-16" data-price-key="fullInterior">
                          $109
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Complete interior restoration and protection
                        </div>
                        <div className="w-layout-vflex flex-block-25">
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Everything in Quick Interior
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Plastics cleaned and conditioned
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">Interior plastics protected</div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Leather cleaning and conditioning
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Air vent cleaning and sanitizing
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 2–3 hours</h6>
                    </label>
                    <label className="radio-button-field-4 w-radio">
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-2 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Maintenance Detail"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-31">
                        <h6 className="heading-15">Maintenance Detail</h6>
                        <h6 className="heading-16" data-price-key="maintenance">
                          $99
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Basic interior and exterior refresh for well-maintained
                          vehicles.
                        </div>
                        <div className="w-layout-vflex flex-block-321">
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Everything in Quick Exterior
                            </div>
                          </div>
                          <div className="w-layout-hflex flex-block-26">
                            <img src="/images/Isolation_Mode_4.svg" width="12" />
                            <div className="text-block-8">
                              Everything in Quick Interior
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 2–3 hours</h6>
                    </label>
                    <label className="radio-button-field-4 w-radio">
                      <div className="text-block-12">POPULAR</div>
                      <div className="w-form-formradioinput w-form-formradioinput--inputType-custom radio-button-3 w-radio-input" />
                      <input
                        type="radio"
                        name="Service"
                        value="Show Room Detail"
                        required
                        style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                      />
                      <div className="w-layout-hflex flex-block-33">
                        <h6 className="heading-15">Show Room Detail</h6>
                        <h6 className="heading-16" data-price-key="showroom">
                          $179
                        </h6>
                      </div>
                      <div className="content-style-23">
                        <div className="text-130">
                          Full-service restoration of both interior and exterior
                          surfaces.
                        </div>
                        <div className="w-layout-hflex flex-block-32">
                          <div className="content-style-14">
                            <div className="text-80">Exterior:</div>
                            <div className="w-layout-vflex flex-block-8">
                              <div className="w-layout-hflex flex-block-6">
                                <img src="/images/Isolation_Mode_4.svg" width="12" />
                                <div className="text-block-4">
                                  Everything in Full Exterior
                                </div>
                              </div>
                              <div className="w-layout-hflex flex-block-6">
                                <img src="/images/Isolation_Mode_4.svg" width="12" />
                                <div className="text-block-4">
                                  2-step paint decontamination (iron decon + clay bar)
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="content-style-14">
                            <div className="text-80">Interior:</div>
                            <div className="w-layout-vflex flex-block-5">
                              <div className="w-layout-hflex flex-block-6">
                                <img src="/images/Isolation_Mode_4.svg" width="12" />
                                <div className="text-block-4">
                                  Everything in Full Interior
                                </div>
                              </div>
                              <div className="w-layout-hflex flex-block-6">
                                <img src="/images/Isolation_Mode_4.svg" width="12" />
                                <div className="text-block-4">
                                  Carpets & Upholstery steam cleaned + conditioned
                                </div>
                              </div>
                              <div className="w-layout-hflex flex-block-6">
                                <img src="/images/Isolation_Mode_4.svg" width="12" />
                                <div className="text-block-4">
                                  Plastics & leather steamed
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h6 className="heading-17">Duration: 3–5 hours</h6>
                    </label>
                  </div>
                  {/* Step 2: Add-Ons */}
                  <div className="w-layout-vflex flex-block-35">
                    <h5 className="heading-14">Add-Ons</h5>

                    <div className="w-layout-hflex flex-block-34">
                      <label className="w-checkbox checkbox-field-2">
                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-3" />
                        <input
                          type="checkbox"
                          style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                          data-price-key="addonPetHair"
                        />
                        <div className="w-layout-vflex flex-block-37">
                          <div className="w-layout-hflex flex-block-38">
                            <img src="/images/paw.svg" />
                            <div className="w-layout-hflex flex-block-42">
                              <h6 className="heading-18">Pet Hair Removal</h6>
                              <h6 className="heading-18">+$29</h6>
                            </div>
                          </div>
                          <div className="text-131">
                            Specialized tools for stubborn pet hair
                          </div>
                        </div>
                      </label>

                      <label className="w-checkbox checkbox-field-2">
                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-3" />
                        <input
                          type="checkbox"
                          style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                          data-price-key="addonFabricProtect"
                        />
                        <div className="w-layout-vflex flex-block-322">
                          <div className="w-layout-hflex flex-block-323">
                            <img src="/images/protection.svg" />
                            <div className="w-layout-hflex flex-block-36">
                              <h6 className="heading-18">Fabric Protection Coating</h6>
                              <h6 className="heading-18">+$29</h6>
                            </div>
                          </div>
                          <div className="text-131">
                            Shields fabric from stains and liquid damage
                          </div>
                        </div>
                      </label>

                      <label className="w-checkbox checkbox-field-2">
                        <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-3" />
                        <input
                          type="checkbox"
                          style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                          data-price-key="addonIronDecon"
                        />
                        <div className="w-layout-vflex flex-block-39">
                          <div className="w-layout-hflex flex-block-40">
                            <img src="/images/Wheel.svg" />
                            <div className="w-layout-hflex flex-block-41">
                              <h6 className="heading-18">Iron Decontamination</h6>
                              <h6 className="heading-18">+$39</h6>
                            </div>
                          </div>
                          <div className="text-131">
                            Remove iron fallout and brake dust from paint & wheels
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Step 2: Selection Summary */}
                  <div className="w-layout-vflex flex-block-325">
                    <h6 className="heading-19">Selection Summary</h6>

                    <div className="w-layout-vflex flex-block-326">
                      <div className="w-layout-hflex flex-block-327">
                        <div id="package-name" className="text-block-9">No package selected</div>
                        <div id="package-price" className="text-block-9">$0</div>
                      </div>

                      <div className="w-layout-hflex flex-block-327">
                        <div id="addons-count" className="text-block-9">Add-ons (0 selected)</div>
                        <div id="adding-price" className="text-block-9">$0</div>
                      </div>

                      <div id="addons-list" className="text-block-9" />
                    </div>

                    <div className="w-layout-hflex flex-block-43">
                      <div className="text-block-11">Total</div>
                      <div id="total-price" className="text-block-11">$0</div>
                    </div>
                  </div>
                  <div className="w-layout-hflex flex-block-19">
                    <a href="#" className="back-button w-inline-block" data-back>
                      <img src="/images/back.svg" className="back-arrow" />
                      <div className="back-text">Back</div>
                    </a>
                    <a href="#" className="nextbutton w-inline-block" data-next>
                      <div className="nexttext">Next</div>
                      <img src="/images/next.svg" className="nextarrow" />
                    </a>
                  </div>
          </div>
        </div>

                <div
          className="w-layout-vflex flex-block-329 form-step"
          data-step="3"
          id="step-3"
          role="region"
          aria-labelledby="step-3-label"
        >
          <h4 className="heading-12" id="step-3-label">
            Date & Time Selection
          </h4>

          <h5 className="heading-13">
            Choose your preferred date and time slot
          </h5>

          <div className="w-layout-vflex flex-block-330">
            <h6 className="heading-19">Selection Summary</h6>

            <div className="w-layout-vflex flex-block-331">
              <div id="package-name-2" className="text-block-13">
                Quick Interior Detail
              </div>
              <div id="addons-count-2" className="text-block-13">
                Add-ons (0 selected)
              </div>
            </div>

            <h6 id="estimated-duration" className="heading-20">
              Estimated duration: 1-2 hours
            </h6>
          </div>

          <div className="w-layout-vflex flex-block-21">
            <h5 className="heading-21">Select Date</h5>

            <div className="w-layout-vflex calendar-wrapper">
              <div className="w-layout-hflex calendar-header">
                <img
                  id="prevMonth"
                  src="/images/button.svg"
                  className="prev-month"
                  alt=""
                />

                <h6 id="monthLabel" className="month-label">
                  July 2025
                </h6>

                <img
                  id="nextMonth"
                  src="/images/button2.svg"
                  width={10}
                  className="next-month"
                  alt=""
                />
              </div>

              <div className="w-layout-grid calendar-weekdays">
                <div className="weekday-label">Sun</div>
                <div className="weekday-label">Mon</div>
                <div className="weekday-label">Tue</div>
                <div className="weekday-label">Wed</div>
                <div className="weekday-label">Thu</div>
                <div className="weekday-label">Fri</div>
                <div className="weekday-label">Sat</div>
              </div>

              <div className="w-layout-grid calendar-grid">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="calendar-day">
                    <div className="day-nummber"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-layout-vflex flex-block-333">
            <h5 className="heading-21">Select Time</h5>
            <h6 className="heading-23">
              <span id="available-times-label">Select a date to see available times</span>
            </h6>

            <div className="w-layout-grid grid"></div>
          </div>

          <div className="w-layout-vflex flex-block-334">
            <img src="/images/clock.svg" alt="" />

            <div className="w-layout-vflex flex-block-335">
              <div className="text-block-14">Service Duration</div>
              <div className="duration-info" id="duration-info">
                Please select a time to see your service schedule.
              </div>
            </div>
          </div>

          <div className="w-layout-vflex flex-block-336">
            <div className="text-block-14">Service Summary</div>

            <div className="w-layout-hflex flex-block-337">
              <div className="text-block-16">Date:</div>
              <div id="summary-date" className="summary-date">
                January 15, 2025
              </div>
            </div>

            <div className="w-layout-hflex flex-block-337">
              <div className="text-block-16">Time:</div>
              <div id="summary-time" className="summary-time">
                Select a time
              </div>
            </div>

            <div className="w-layout-hflex flex-block-337">
              <div className="text-block-16">Service:</div>
              <div id="summary-service" className="summary-service">
                Premium Full Detail
              </div>
            </div>

            <div className="w-layout-hflex flex-block-337">
              <div className="text-block-16">Duration:</div>
              <div id="summary-duration" className="summary-duration">
                4-5 hours
              </div>
            </div>
          </div>

          <div className="w-layout-hflex flex-block-19">
            <a href="#" className="back-button w-inline-block" data-back>
              <img src="/images/back.svg" className="back-arrow" />
              <div className="back-text">Back</div>
            </a>

            <a href="#" className="nextbutton w-inline-block" data-next>
              <div className="nexttext">Next</div>
              <img src="/images/next.svg" className="nextarrow" />
            </a>
          </div>
        </div>

                <div
          className="w-layout-vflex flex-block-338 form-step"
          data-step="4"
          id="step-4"
          role="region"
          aria-labelledby="step-4-label"
        >
          <h4 className="heading-12" id="step-4-label">
            Customer Information
          </h4>
          <h5 className="heading-13">Tell us how to reach you</h5>

          <div className="w-layout-vflex flex-block-339">
            <div className="w-layout-hflex flex-block-340">
              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="first-name" className="field-label-2">
                  First Name *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={256}
                  id="first-name"
                  name="first-name"
                  type="text"
                  required
                />
              </div>

              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="last-name" className="field-label-2">
                  Last Name *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={256}
                  id="last-name"
                  name="last-name"
                  type="text"
                  required
                />
              </div>
            </div>

            <div className="w-layout-hflex flex-block-340">
              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="phone-number" className="field-label-2">
                  Phone Number *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={20}
                  id="phone-number"
                  name="phone-number"
                  type="tel"
                  required
                />
              </div>

              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="email-address" className="field-label-2">
                  Email *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={256}
                  id="email-address"
                  name="email-address"
                  type="email"
                  required
                />
              </div>
            </div>

            <h6 className="heading-24">
              Service Location
            </h6>

            <div className="w-layout-vflex flex-block-341">
              <label htmlFor="street-address" className="field-label-2">
                Street Address *
              </label>
              <input
                className="text-field-2 w-input"
                maxLength={256}
                id="street-address"
                name="street-address"
                type="text"
                required
              />
            </div>

            <div className="w-layout-hflex flex-block-340">
              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="city" className="field-label-2">
                  City *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={256}
                  id="city"
                  name="city"
                  type="text"
                  required
                />
              </div>

              <div className="w-layout-vflex flex-block-341">
                <label htmlFor="state" className="field-label-2">
                  State *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={256}
                  id="state"
                  name="state"
                  type="text"
                  required
                />
              </div>

            <div className="w-layout-vflex flex-block-341">
              <label htmlFor="zip-code" className="field-label-2">
                ZIP Code *
                </label>
                <input
                  className="text-field-2 w-input"
                  maxLength={10}
                  id="zip-code"
                  name="zip-code"
                  type="text"
                  required
              />
            </div>
          </div>
          <div className="additional-instructions">
            <h6 className="heading-20">Additional Instructions (optional)</h6>
            <textarea
              id="additional-instructions"
              name="additional-instructions"
              className="text-field-2 notes-textarea"
              placeholder="Gate code, parking instructions, special requests..."
            />
          </div>
        </div>

          <div className="w-layout-hflex flex-block-349" style={{ display: "none" }}>
            <img src="/images/caution.svg" alt="" />
            <div className="w-layout-vflex flex-block-350">
              <div className="text-block-23">Address Outside Service Area</div>
              <div className="text-block-24">
                Sorry, this address is outside our current service area. We currently serve areas within 25 miles of downtown Wesley Chapel. Please contact us if you&apos;d like to discuss special arrangements.
              </div>
            </div>
          </div>

          <div className="important-note-card">
            <div className="note-heading">
              <img src="/images/caution.svg" alt="" className="note-icon" />
              <div className="heading-20">Important Notes</div>
            </div>
            <ul className="note-list">
              <li>Remove all personal items from your vehicle before service.</li>
              <li>Access to an outdoor water spigot within 100 feet of the vehicle is required.</li>
              <li>Access to a standard electrical outlet within 100 feet is required.</li>
            </ul>
            <label className="confirm-checkbox">
              <input type="checkbox" id="confirm-water-power" required />
              <span>I confirm I have water and power access available within 100 feet of my vehicle.</span>
            </label>
          </div>

          <div className="w-layout-hflex flex-block-19">
            <a href="#" className="back-button w-inline-block" data-back>
              <img src="/images/back.svg" className="back-arrow" />
              <div className="back-text">Back</div>
            </a>

            <a href="#" className="nextbutton w-inline-block" data-next>
              <div className="nexttext">Continue to Payment</div>
              <img src="/images/next.svg" className="nextarrow" />
            </a>
          </div>
        </div>

                <div
          className="w-layout-vflex flex-block-338 form-step"
          data-step="5"
          id="step-5"
          role="region"
          aria-labelledby="step-5-label"
        >
          <h4 className="heading-12" id="step-5-label">
            Payment & Booking Confirmation
          </h4>

          <h5 className="heading-13">
            Review your booking details and pay your deposit to confirm
          </h5>

          <div className="w-layout-vflex flex-block-330">
            <h6 className="heading-19">Final Summary</h6>

            <div className="w-layout-vflex flex-block-331">
              <div id="summary-service-name" className="text-block-13">
                Premium Full Detail
              </div>
              <div id="summary-addons" className="text-block-13">
                Add-ons (0 selected)
              </div>
            </div>

            <h6 id="summary-duration-final" className="heading-20">
              Estimated duration: 4–5 hours
            </h6>
          </div>

          <div className="w-layout-vflex flex-block-339">

            <div className="w-layout-vflex flex-block-341 payment-block">
              <h5 className="heading-21">Date & Time</h5>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Date:</div>
                <div id="payment-date" className="payment-value">
                  January 15, 2025
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Time:</div>
                <div id="payment-time" className="payment-value">
                  9:00 AM – 2:00 PM
                </div>
              </div>
            </div>

            <div className="w-layout-vflex flex-block-341 payment-block">
              <h5 className="heading-21">Customer Info</h5>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Name:</div>
                <div id="payment-name" className="payment-value">
                  John Smith
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Email:</div>
                <div id="payment-email" className="payment-value">
                  john.smith@email.com
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Phone:</div>
                <div id="payment-phone" className="payment-value">
                  (555) 123-4567
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Address:</div>
                <div id="payment-address" className="payment-value">
                  123 Main Street, Los Angeles, CA 90210
                </div>
              </div>
            </div>

            <div className="w-layout-vflex flex-block-341 payment-block">
              <h5 className="heading-21">Vehicle</h5>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Type:</div>
                <div id="payment-vehicle-type" className="payment-value">
                  Sedan
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Model:</div>
                <div id="payment-vehicle-model" className="payment-value">
                  2022 Honda Accord
                </div>
              </div>

              <div className="w-layout-hflex flex-block-340">
                <div className="payment-label">Color:</div>
                <div id="payment-vehicle-color" className="payment-value">
                  Silver
                </div>
              </div>
            </div>

            <div className="w-layout-vflex flex-block-369">
              <div className="text-block-36">Payment Summary</div>

              <div className="w-layout-vflex flex-block-371">
                <div className="w-layout-hflex booking-total-wrapper">
                  <div className="booking-summary">Service Total:</div>
                  <div id="payment-service-total" className="service-total">
                    $302.00
                  </div>
                </div>

                <div className="w-layout-hflex booking-total-wrapper">
                  <div className="booking-summary">Deposit Due Now:</div>
                  <div id="payment-deposit" className="deposit-paid">
                    $50.00
                  </div>
                </div>
              </div>

              <div className="w-layout-hflex flex-block-372">
                <div className="booking-summary">
                  Remaining Balance (Day of Service):
                </div>
                <div id="payment-balance" className="service-total">
                  $252.00
                </div>
              </div>
            </div>

            <div className="w-layout-vflex flex-block-381 payment-options">
              <h5 className="heading-21">Pay Deposit</h5>

              <div id="stripe-container" className="stripe-container">
              </div>

              <div id="paypal-container" className="paypal-container">
              </div>
            </div>
          </div>

          <div className="w-layout-hflex flex-block-19">
            <a href="#" className="back-button w-inline-block" data-back>
              <img src="/images/back.svg" className="back-arrow" />
              <div className="back-text">Back</div>
            </a>

            <a
              href="#"
              id="completeBooking"
              className="button-primary-7 w-inline-block"
            >
              <div className="nexttext">Confirm & Pay</div>
              <img src="/images/next.svg" className="nextarrow" />
            </a>
          </div>
        </div>

      </form>
      {/* END FORM */}
    </div>
    </div>

    <div className="footer">
      <div className="columns-3">
            <div className="column-13">
              <div className="title-style">
                <div className="logo-wrapper">
                  <img
                    src="/images/image-1.png"
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
                    method="get"
                    className="form"
                  >
                    <input
                      className="text-field w-input"
                      maxLength={256}
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      id="email"
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
                    <a href="#" className="link">About Us</a>
                    <div className="link-style">
                      <a href="#" className="link-2">Pricing</a>
                    </div>
                    <div className="link-style">
                      <a href="#" className="link-3">Book Now</a>
                    </div>
                    <div className="link-style">
                      <a href="#" className="link-4">Get a Quote</a>
                    </div>
                    <div className="link-style">
                      <a href="#" className="link-5">Gallery</a>
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
                        src="/images/Background_3.svg"
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
                        src="/images/Background_1.svg"
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
                        src="/images/Background.svg"
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
                        src="/images/Background_2.svg"
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
              src="/images/Divider.svg"
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
                  <Link href="/privacy-policy" className="link-11">
                    Privacy Policy
                  </Link>
                </div>

                <div className="text-61">
                  <Link href="/terms-of-service" className="link-12">
                    Terms of Service
                  </Link>
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
      </>
    );
}
