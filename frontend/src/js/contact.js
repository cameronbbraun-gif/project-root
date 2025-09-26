// frontend/js/contact.js
// Robust contact form handler that works with either #contact-form or legacy #webflow-form

document.addEventListener("DOMContentLoaded", () => {
  // 0) Find the form by multiple selectors to be resilient to markup changes
  const form =
    document.getElementById("contact-form") ||
    document.getElementById("webflow-form") ||
    document.querySelector("form.form-style-3") ||
    document.querySelector(".form-wrapper-2 form") ||
    document.querySelector("form");

  if (!form) {
    console.error("Contact form not found (tried #contact-form, #webflow-form, form.form-style-3)." );
    return;
  }

  // 1) Find a Webflow-like wrapper and success/fail boxes (create if missing)
  const wrapper = form.closest(".w-form") || form.parentElement;

  let doneBox = wrapper?.querySelector(".w-form-done");
  let failBox = wrapper?.querySelector(".w-form-fail");

  // If boxes do not exist (common outside Webflow hosting), create minimal ones
  if (!doneBox) {
    doneBox = document.createElement("div");
    doneBox.className = "w-form-done";
    doneBox.innerHTML = '<div class="success-message">Thank you! Your submission has been received.</div>';
    doneBox.style.display = "none";
    wrapper.appendChild(doneBox);
  }
  if (!failBox) {
    failBox = document.createElement("div");
    failBox.className = "w-form-fail";
    failBox.innerHTML = '<div class="error-message">Oops! Something went wrong while submitting the form.</div>';
    failBox.style.display = "none";
    wrapper.appendChild(failBox);
  }

  // 2) Hide both on load
  doneBox.style.display = "none";
  failBox.style.display = "none";

  // 3) Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather fields safely by name (set in HTML patch):
    const data = {
      first_name: form.querySelector('[name="first_name"]')?.value?.trim() || "",
      last_name: form.querySelector('[name="last_name"]')?.value?.trim() || "",
      email: form.querySelector('[name="email"]')?.value?.trim() || "",
      message: form.querySelector('[name="message"]')?.value?.trim() || "",
    };

    // Basic front-end validation
    if (!data.first_name || !data.last_name || !data.email || !data.message) {
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent = "Please complete all required fields.";
      return;
    }

    // If you have a backend endpoint, set it here. Otherwise, show success (sanity test)
    const endpoint = form.getAttribute("action");

    if (!endpoint) {
      // No backend configured: show success so we know UI is wired
      doneBox.style.display = "block";
      failBox.style.display = "none";
      console.log("[contact] No form action set; showing success UI (front-end only).");
      form.reset();
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: form.getAttribute("method") || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        doneBox.style.display = "block";
        failBox.style.display = "none";
        form.reset();
      } else {
        const text = await res.text();
        doneBox.style.display = "none";
        failBox.style.display = "block";
        failBox.textContent = `Submission failed (${res.status}). ${text || ""}`;
      }
    } catch (err) {
      console.error("[contact] Network error:", err);
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent = "Network error submitting form. Please try again.";
    }
  });
});