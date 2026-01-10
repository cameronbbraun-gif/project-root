/* eslint-disable @typescript-eslint/no-explicit-any */

// This function is called from React (useEffect) in contact/page.tsx.
export function initContactForm() {
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

  form.addEventListener("submit", async (e: Event) => {
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

    const data = { first_name: first, last_name: last, email, message };

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

    if (error.length > 0) {
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent = error.join("\n");
      return;
    }

    const endpoint =
      form.getAttribute("action") ||
      `${window.location.origin}/api/contact`;

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
        failBox.style.display = "none";

        const doneInner = doneBox.querySelector("div") || doneBox;
        doneInner.textContent = "Thanks! Your message was sent.";

        (form as HTMLFormElement).reset();
      } else {
        const errorMsg = Array.isArray(payload?.msg)
          ? payload.msg.join("\n")
          : payload?.error || `Submission failed (${res.status}).`;

        doneBox.style.display = "none";
        failBox.style.display = "block";

        const failInner = failBox.querySelector("div") || failBox;
        failInner.textContent = errorMsg;
      }
    } catch (err) {
      console.error("[contact] Network error:", err);
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent =
        "Network error submitting form. Please try again.";
    }
  }, { capture: true });
}
