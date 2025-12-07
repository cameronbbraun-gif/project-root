"use client";

import { useEffect } from "react";
import { initPricing } from "./pricing";
import "./pricing.css";

export default function PricingPage() {
    useEffect(() => {
        initPricing();
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
              <a href="/" className="navbar-brand-5 w-nav-brand">
                <img
                  src="/images/logo.png"
                  loading="lazy"
                  width={92}
                  alt=""
                  className="image-13"
                />
                <h1 className="heading-3">Detail Geeks</h1>
              </a>
              <nav role="navigation" className="nav-menu-wrapper-4 w-nav-menu">
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
                    <a
                      href="/pricing"
                      aria-current="page"
                      className="nav-link-4 w--current"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="nav-link-4">
                      Contact
                    </a>
                  </li>
                  <li>
                    <div className="nav-divider-3" />
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
                <div className="w-icon-nav-menu" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-stack">
        <div className="div-block-18" />
        <div className="div-block-19" />
        <div className="small-container-2">
          <div className="title-section-6">
            <div className="title-section-6">
              <div className="text-71">Pricing</div>
              <div className="text-72">
                Experience the ultimate in car care with our comprehensive interior and
                exterior detailing services tailored to your needs..
              </div>
            </div>
            <div className="button-wrapper-5">
              <div className="actions-11">
                <a href="/book" className="button-style-16">
                  <div className="text-73">Book Now</div>
                </a>
              </div>
              <div className="actions-11">
                <a href="/pricing" className="button-style-17">
                  <div className="text-73">Learn More</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-stack-2">
        <div className="small-container-3">
          <div className="title-section-7">
            <div className="title-section-7">
              <div className="text-74">Select Your Vehicle Type</div>
              <div className="choose-the-type-of-vehicle-you-have-so-we-can-match-your-car-to-the-right-package">
                Choose the type of vehicle you have so we can match your car to the
                right package{" "}
              </div>
            </div>
            <div
              className="actions-12"
              role="radiogroup"
              aria-label="Select vehicle type"
            >
              <div
                className="content-style-11 vehicle-option vehicle-active"
                data-vehicle="sedan"
                role="radio"
                aria-checked="true"
              >
                <a href="#" className="button-style-18" />
                <div className="text-75">Sedan</div>
                <img
                  src="/images/sedan.svg"
                  loading="lazy"
                  alt=""
                  className="image-4"
                />
              </div>
              <div
                className="content-style-11 vehicle-option"
                data-vehicle="suv"
                role="radio"
                aria-checked="false"
              >
                <a href="#" className="button-style-18" />
                <div className="text-75">SUV</div>
                <img
                  src="/images/suv.svg"
                  loading="lazy"
                  alt=""
                  className="image-5"
                />
              </div>
              <div
                className="content-style-12 vehicle-option"
                data-vehicle="truck"
                role="radio"
                aria-checked="false"
              >
                <a href="#" className="button-style-19" />
                <div className="text-75">Large SUV/Truck</div>
                <img
                  src="/images/truck.svg"
                  loading="lazy"
                  alt=""
                  className="image-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exterior Packages */}
      <div className="team-rectangles">
        <div className="container-20">
          <div className="section-title-2">
            <div className="frame-3">
              <div className="div-block-21" />
              <div className="text-76">Exterior Packages</div>
              <div className="div-block-21" />
            </div>
            <div className="text-77">
              Revitalize your vehicle’s exterior with our comprehensive full exterior
              detailing service.
            </div>
          </div>
          <div className="columns-8">
            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/car-wash-3960877-2-1.png"
                  loading="lazy"
                  width={606}
                  height={291}
                  alt=""
                  className="car-wash-3960877-2-1"
                />
              </div>
              <div className="info-4">
                <div className="frame-4">
                  <div className="text-86">Quick Exterior</div>
                  <div className="div-block-22">
                    <div className="text-block-2" data-price-id="quickExterior">
                      $49
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Our comprehensive exterior detailing service includes restoration and
                  protection for a showroom-quality finish.
                </div>
                <div className="div-block-20" />
                <div className="content-style-14">
                  <div className="text-80">Includes:</div>
                  <div className="w-layout-vflex flex-block-5">
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Foam cannon bath</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">2-bucket hand wash</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Wheel cleaning</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Tire shine dressing</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Windows cleaned inside/out
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-20">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>

            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/AdobeStock_637319521-3-1.png"
                  loading="lazy"
                  width={619}
                  height={291}
                  alt=""
                  className="car-wash-3960877-2-1"
                />
              </div>
              <div className="info-4">
                <div className="frame-5">
                  <div className="text-82">Full Exterior</div>
                  <div className="div-block-22">
                    <div className="text-block-3" data-price-id="fullExterior">
                      $119
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Our comprehensive exterior detailing service includes restoration and
                  protection for a showroom-quality finish.
                </div>
                <div className="div-block-20" />
                <div className="content-style-14">
                  <div className="text-80">Includes:</div>
                  <div className="w-layout-vflex flex-block-5">
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Everything in Quick Exterior
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        4-6 month wax application
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Bug and tar removal</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Trim restoration</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Clay bar decontamination
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-20">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="text-77">
            **Additional costs may be charged upon arrival due to excessively soiled
            cars**
          </div>
        </div>
      </div>

      <div className="team-rectangles-2">
        <div className="container-20">
          <div className="section-title-2">
            <div className="frame-3">
              <div className="div-block-23" />
              <div className="text-83">Interior Packages</div>
              <div className="div-block-23" />
            </div>
            <div className="text-84">
              Transform your vehicle&apos;s interior with our interior cleaning and
              detailing services.
            </div>
          </div>
          <div className="columns-8">
            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/AdobeStock_243325385-2.jpeg"
                  loading="lazy"
                  alt=""
                  className="image-8"
                />
              </div>
              <div className="info-4">
                <div className="frame-4">
                  <div className="text-78">Quick Interior</div>
                  <div className="div-block-22">
                    <div className="text-block-2" data-price-id="quickInterior">
                      $79
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Our maintenance interior service provides light cleaning and
                  refreshment for recently detailed or well-kept vehicles.
                </div>
                <div className="div-block-20" />
                <div className="content-style-14">
                  <div className="text-80">Includes:</div>
                  <div className="w-layout-vflex flex-block-5">
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Full Interior Vacuum</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Windows cleaned inside/out
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Clean door jams</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">Interior dusted</div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Plastics wiped down and cleaned
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-20">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>

            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/AdobeStock_314052507-2.jpeg"
                  loading="lazy"
                  alt=""
                  className="image-9"
                />
              </div>
              <div className="info-4">
                <div className="frame-5">
                  <div className="text-82">Full Interior</div>
                  <div className="div-block-22">
                    <div className="text-block-3" data-price-id="fullInterior">
                      $149
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Our complete interior detailing delivers deep cleaning, stain
                  treatment, and plastic restoration for a like-new cabin environment.
                </div>
                <div className="div-block-20" />
                <div className="content-style-14">
                  <div className="text-80">Includes:</div>
                  <div className="w-layout-vflex flex-block-5">
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Everything in Quick Interior
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Plastics cleaned and conditioned
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Interior plastics protected
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Leather cleaning and conditioning
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Air vent cleaning and sanitizing
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-20">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="text-85">
            **Additional costs may be charged upon arrival due to excessively soiled
            cars**
          </div>
        </div>
      </div>

      {/* Full Packages */}
      <div className="team-rectangles-3">
        <div className="container-20">
          <div className="section-title-2">
            <div className="frame-3">
              <div className="div-block-21" />
              <div className="text-76">Full Packages</div>
              <div className="div-block-21" />
            </div>
            <div className="text-77">
              Experience the ultimate in car care with our comprehensive interior and
              exterior detailing services.
            </div>
          </div>
          <div className="columns-8">
            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/Img4-2.jpg"
                  loading="lazy"
                  alt=""
                  className="image-11"
                />
              </div>
              <div className="info-5">
                <div className="frame-4-copy">
                  <div className="text-88">Maintenance Detail</div>
                  <div className="div-block-22">
                    <div className="text-block-5" data-price-id="maintenance">
                      $109
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Quick interior and exterior cleaning package. Recommended for cars with
                  waxes or ceramic coatings applied to keep your car in excellent
                  condition.
                </div>
                <div className="div-block-20" />
                <div className="content-style-14">
                  <div className="text-80">Includes:</div>
                  <div className="w-layout-vflex flex-block-5">
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Everything in Quick Exterior
                      </div>
                    </div>
                    <div className="w-layout-hflex flex-block-6">
                      <img
                        src="/images/Isolation_Mode_4.svg"
                        loading="lazy"
                        width={12}
                        alt=""
                        className="image-7"
                      />
                      <div className="text-block-4">
                        Everything in Quick Interior
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-21">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>

            <div className="card-4">
              <div className="image-wrapper-10">
                <img
                  src="/images/AdobeStock_543927925-1.jpg"
                  loading="lazy"
                  alt=""
                  className="image-10"
                />
              </div>
              <div className="info-5">
                <div className="frame-6">
                  <div className="text-87">Show Room Detail</div>
                  <div className="div-block-22">
                    <div className="text-block-3" data-price-id="showroom">
                      $199
                    </div>
                  </div>
                </div>
                <div className="text-79">
                  Our signature full detail offers a complete deep clean and protective
                  treatment for every surface, inside and out.
                </div>
                <div className="div-block-20" />
                <div className="w-layout-hflex flex-block-7">
                  <div className="content-style-14">
                    <div className="text-80">Exterior:</div>
                    <div className="w-layout-vflex flex-block-8">
                      <div className="w-layout-hflex flex-block-6">
                        <img
                          src="/images/Isolation_Mode_4.svg"
                          loading="lazy"
                          width={12}
                          alt=""
                          className="image-7"
                        />
                        <div className="text-block-4">
                          Everything in Full Exterior
                        </div>
                      </div>
                      <div className="w-layout-hflex flex-block-6">
                        <img
                          src="/images/Isolation_Mode_4.svg"
                          loading="lazy"
                          width={12}
                          alt=""
                          className="image-7"
                        />
                        <div className="text-block-4">
                          2 step paint decontamination (iron decon and clay bar
                          treatment)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-style-14">
                    <div className="text-80">Interior:</div>
                    <div className="w-layout-vflex flex-block-5">
                      <div className="w-layout-hflex flex-block-6">
                        <img
                          src="/images/Isolation_Mode_4.svg"
                          loading="lazy"
                          width={12}
                          alt=""
                          className="image-7"
                        />
                        <div className="text-block-4">
                          Everything in Full Interior
                        </div>
                      </div>
                      <div className="w-layout-hflex flex-block-6">
                        <img
                          src="/images/Isolation_Mode_4.svg"
                          loading="lazy"
                          width={12}
                          alt=""
                          className="image-7"
                        />
                        <div className="text-block-4">
                          Carpets and Upholstery steam cleaned conditioned
                        </div>
                      </div>
                      <div className="w-layout-hflex flex-block-6">
                        <img
                          src="/images/Isolation_Mode_4.svg"
                          loading="lazy"
                          width={12}
                          alt=""
                          className="image-7"
                        />
                        <div className="text-block-4">
                          Plastics and leather steamed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-13">
                  <a href="/book" className="button-style-22">
                    <div className="text-81">Book Now</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="text-77">
            **Additional costs may be charged upon arrival due to excessively soiled
            cars**
          </div>
        </div>
      </div>

      {/* Add-on Services */}
      <div className="team-rectangles-4">
        <div className="container-21">
          <div className="section-title-3">
            <div className="frame-7">
              <div className="text-89">Add-on Services</div>
            </div>
            <div className="text-90">
              Explore our add-on services to tailor your detailing experience to your
              unique preferences.
            </div>
          </div>
          <div className="columns-9">
            <div className="card-5">
              <div className="info-6">
                <div className="content-style-16">
                  <img
                    src="/images/Vector_3.svg"
                    loading="lazy"
                    width={55}
                    alt=""
                  />
                  <div className="title-style-4">
                    <div className="name">Pet Hair Removal</div>
                    <div className="text-91" data-price-id="addonPetHair">
                      $19
                    </div>
                  </div>
                </div>
                <div className="description-7">
                  Specialized treatment to remove stubborn pet hair from upholstery and
                  carpets.
                </div>
              </div>
            </div>

            <div className="card-5">
              <div className="info-6">
                <div className="content-style-16">
                  <img
                    src="/images/Vector_4.svg"
                    loading="lazy"
                    width={55}
                    alt=""
                    className="image-12"
                  />
                  <div className="title-style-5">
                    <div className="name">Fabric Protection Coating</div>
                    <div className="text-91" data-price-id="addonFabricProtect">
                      $29
                    </div>
                  </div>
                </div>
                <div className="description-7">
                  Shield your carpets and upholstery from spills and stains
                </div>
              </div>
            </div>

            <div className="card-5">
              <div className="info-6">
                <div className="content-style-16">
                  <img
                    src="/images/Vector_2.svg"
                    loading="lazy"
                    width={55}
                    alt=""
                  />
                  <div className="title-style-6">
                    <div className="name">Iron Decontamination</div>
                    <div className="text-91" data-price-id="addonIronDecon">
                      $39
                    </div>
                  </div>
                </div>
                <div className="description-7">
                  Removes embedded brake dust and iron particles from paint and wheels
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="hero-heading-left-10">
        <div className="div-block-16" />
        <div className="div-block-17" />
        <div className="container-19">
          <div className="column-19">
            <div className="column-19">
              <h1 className="title-copy-goes-here-be-awesome-11">
                Book Your Detailing Service Today
              </h1>
              <p className="lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit-suspendisse-varius-enim-in-eros-elementum-tri-8">
                Experience the best mobile car detailing in Tampa. Contact us for a
                sparkling clean ride!
              </p>
            </div>
            <div className="column-20">
              <div className="actions-10">
                <a href="/book" className="button-style-14">
                  <div className="text-69">Book Now</div>
                </a>
              </div>
              <div className="actions-10">
                <a
                  href="/pricing"
                  aria-current="page"
                  className="button-style-15 w--current"
                >
                  <div className="text-70">Learn More</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="columns-3">
          <div className="column-13">
            <div className="title-style">
              <div className="logo-wrapper">
                <img
                  src="/images/image-1.png"
                  loading="lazy"
                  width={86}
                  height={77}
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
                By subscribing, you agree to our Privacy Policy and consent to receive
                updates from our company.
              </div>
            </div>
          </div>
          <div className="small-columns">
            <div className="column-14">
              <div className="content-style-5">
                <div className="text-60">Quick Links</div>
                <div className="footer-links">
                  <a href="/about-us" className="link">
                    About Us
                  </a>
                  <div className="link-style">
                    <a href="/pricing" className="link-2">
                      Pricing
                    </a>
                  </div>
                  <div className="link-style">
                    <a href="/book" className="link-3">
                      Book Now
                    </a>
                  </div>
                  <div className="link-style">
                    <a href="/get-a-quote" className="link-4">
                      Get a Quote
                    </a>
                  </div>
                  <div className="link-style">
                    <a href="/gallery" className="link-5">
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
                      src="/images/Background_3.svg"
                      loading="lazy"
                      width={19}
                      height={19}
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
                      width={19}
                      height={19}
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
                      width={19}
                      height={19}
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
                      width={19}
                      height={19}
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
            width={1312}
            height={1}
            alt=""
            className="divider"
          />
          <div className="row">
            <div className="link-style-2">
              © 2025 Detail Geeks Auto Spa. All rights reserved.
            </div>
            <div className="title-style">
              <div className="text-61">
                <a href="/privacy-policy" className="link-11">
                  Privacy Policy
                </a>
              </div>
              <div className="text-61">
                <a href="/terms-of-service" className="link-12">
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
    </>
  );
}