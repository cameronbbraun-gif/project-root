/* eslint-disable @typescript-eslint/no-explicit-any */

type InitContactFormOptions = {
  recaptchaSiteKey?: string;
};

type ContactFormElement = HTMLFormElement & {
  __dgContactHandler?: (e: Event) => void | Promise<void>;
  __dgRecaptchaWidgetId?: number;
};

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        parameters: {
          sitekey: string;
          size?: "normal" | "compact";
          callback?: () => void;
          "expired-callback"?: () => void;
        }
      ) => number;
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
      ready: (callback: () => void) => void;
    };
  }
}

// This function is called from React (useEffect) in contact/page.tsx.
export function initContactForm({ recaptchaSiteKey = "" }: InitContactFormOptions = {}) {
  const form =
    document.getElementById("contact-form") ||
    document.getElementById("webflow-form") ||
    document.querySelector("form.form-style-3") ||
    document.querySelector(".form-wrapper-2 form") ||
    document.querySelector("form");

  if (!form) {
    console.error("Contact form not found.");
    return;
  }

  const contactForm = form as ContactFormElement;
  const submitButton = form.querySelector('.submit-button-2') as HTMLInputElement | null;
  const defaultSubmitLabel = submitButton?.value || "Send";
  const wrapper =
    (form.closest(".w-form") as HTMLElement | null) || form.parentElement;

  let doneBox = wrapper?.querySelector(".w-form-done") as HTMLElement | null;
  let failBox = wrapper?.querySelector(".w-form-fail") as HTMLElement | null;

  if (!doneBox) {
    doneBox = document.createElement("div");
    doneBox.className = "w-form-done";
    doneBox.innerHTML =
      '<div class="success-message">Thank you! Your submission has been received.</div>';
    doneBox.style.display = "none";
    wrapper?.appendChild(doneBox);
  }

  if (!failBox) {
    failBox = document.createElement("div");
    failBox.className = "w-form-fail";
    failBox.innerHTML =
      '<div class="error-message">Oops! Something went wrong while submitting the form.</div>';
    failBox.style.display = "none";
    wrapper?.appendChild(failBox);
  }

  doneBox.style.display = "none";
  failBox.style.display = "none";

  const failInner = failBox.querySelector("div") || failBox;
  const doneInner = doneBox.querySelector("div") || doneBox;

  const showFailure = (message: string) => {
    doneBox.style.display = "none";
    failBox.style.display = "block";
    failInner.textContent = message;
  };

  const hideFailure = () => {
    failBox.style.display = "none";
    failInner.textContent = "";
  };

  const setSubmitting = (isSubmitting: boolean) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.value = isSubmitting ? "Sending..." : defaultSubmitLabel;
    submitButton.setAttribute("aria-busy", isSubmitting ? "true" : "false");
  };

  const ensureRecaptchaWidget = () => {
    if (!recaptchaSiteKey || contactForm.__dgRecaptchaWidgetId !== undefined) {
      return;
    }

    const recaptchaContainer = form.querySelector("#contact-recaptcha") as HTMLElement | null;
    if (!recaptchaContainer || !window.grecaptcha?.render) {
      return;
    }

    const size = window.innerWidth <= 479 ? "compact" : "normal";
    contactForm.__dgRecaptchaWidgetId = window.grecaptcha.render(recaptchaContainer, {
      sitekey: recaptchaSiteKey,
      size,
      callback: () => {
        if (failInner.textContent === "Please complete the reCAPTCHA challenge.") {
          hideFailure();
        }
      },
      "expired-callback": () => {
        showFailure("reCAPTCHA expired. Please complete it again.");
      },
    });
  };

  if (window.grecaptcha?.ready) {
    window.grecaptcha.ready(ensureRecaptchaWidget);
  }

  if (contactForm.__dgContactHandler) {
    return;
  }

  contactForm.__dgContactHandler = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") {
      e.stopImmediatePropagation();
    }

    const first = (form.querySelector('[name="first_name"]') as HTMLInputElement)
      ?.value?.trim() || "";
    const last = (form.querySelector('[name="last_name"]') as HTMLInputElement)
      ?.value?.trim() || "";
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)
      ?.value?.trim() || "";
    const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement)
      ?.value?.trim() || "";
    const termsAccepted = (form.querySelector('[name="terms"]') as HTMLInputElement)
      ?.checked || false;

    const data: Record<string, string> = {
      first_name: first,
      last_name: last,
      email,
      message,
    };

    const error: string[] = [];

    if (!first) error.push("First name is required.");
    if (!last) error.push("Last name is required.");
    if (!email) {
      error.push("Email is required.");
    } else {
      const at = email.indexOf("@");
      const dot = email.lastIndexOf(".");
      if (at < 1 || dot <= at + 1 || dot === email.length - 1) {
        error.push("Please enter a valid email address.");
      }
    }
    if (!message) error.push("Message is required.");
    if (!termsAccepted) {
      error.push("Please accept the Terms of Service and Privacy Policy.");
    }

    if (recaptchaSiteKey) {
      if (!window.grecaptcha || contactForm.__dgRecaptchaWidgetId === undefined) {
        error.push("reCAPTCHA is still loading. Please wait a moment and try again.");
      } else {
        const recaptchaToken = window.grecaptcha.getResponse(contactForm.__dgRecaptchaWidgetId);
        if (!recaptchaToken) {
          error.push("Please complete the reCAPTCHA challenge.");
        } else {
          data.recaptchaToken = recaptchaToken;
        }
      }
    }

    if (error.length > 0) {
      showFailure(error.join("\n"));
      return;
    }

    const apiBase =
      (window as any)?.DG_API_BASE_URL ||
      (window as any)?.NEXT_PUBLIC_API_BASE_URL ||
      (window as any)?.process?.env?.NEXT_PUBLIC_API_BASE_URL ||
      "";
    const endpoint =
      form.getAttribute("action") ||
      (apiBase ? `${apiBase.replace(/\/$/, "")}/api/contact` : `${window.location.origin}/api/contact`);

    setSubmitting(true);

    try {
      const res = await fetch(endpoint, {
        method: (form.getAttribute("method") || "POST").toUpperCase(),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let payload: any = {};
      try {
        payload = await res.json();
      } catch (_) {}

      if (res.ok) {
        doneBox.style.display = "block";
        hideFailure();
        doneInner.textContent = "Thanks! Your message was sent.";

        (form as HTMLFormElement).reset();
      } else {
        const errorMsg = Array.isArray(payload?.msg)
          ? payload.msg.join("\n")
          : payload?.error || `Submission failed (${res.status}).`;

        showFailure(errorMsg);
      }

      if (window.grecaptcha && contactForm.__dgRecaptchaWidgetId !== undefined) {
        window.grecaptcha.reset(contactForm.__dgRecaptchaWidgetId);
      }
    } catch (err) {
      console.error("[contact] Network error:", err);
      showFailure("Network error submitting form. Please try again.");
      if (window.grecaptcha && contactForm.__dgRecaptchaWidgetId !== undefined) {
        window.grecaptcha.reset(contactForm.__dgRecaptchaWidgetId);
      }
    } finally {
      setSubmitting(false);
    }
  };

  form.addEventListener("submit", contactForm.__dgContactHandler, { capture: true });
}
