document.addEventListener("DOMContentLoaded", () => {
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

  const wrapper = form.closest(".w-form") || form.parentElement;

  let doneBox = wrapper?.querySelector(".w-form-done");
  let failBox = wrapper?.querySelector(".w-form-fail");

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

  doneBox.style.display = "none";
  failBox.style.display = "none";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      first_name: form.querySelector('[name="first_name"]')?.value?.trim() || "",
      last_name: form.querySelector('[name="last_name"]')?.value?.trim() || "",
      email: form.querySelector('[name="email"]')?.value?.trim() || "",
      message: form.querySelector('[name="message"]')?.value?.trim() || "",
    };

    console.log("first_name:", data.first_name);
    console.log("last_name:", data.last_name);
    console.log("email:", data.email);
    console.log("message:", data.message);

    const error = [];

    if (!data.first_name) error.push("First name is required.");
    if (!data.last_name) error.push("Last name is required.");
    if (!data.email) {
      error.push("Email is required.");
    } else {
      const at = data.email.indexOf("@");
      const dot = data.email.lastIndexOf(".");
      if (at < 1 || dot <= at + 1 || dot === data.email.length - 1) {
        error.push("Please enter a valid email address.");
      }
    }
    if (!data.message) error.push("Message is required.");

    if (error.length > 0) {
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent = error.join(" \n");
      console.log("[contact] validation error:", error);
      return;
    }

    const endpoint = form.getAttribute("action") || "http://localhost:3000/api/contact";

    if (!endpoint) {
      
      doneBox.style.display = "block";
      failBox.style.display = "none";
      console.log("[contact] No form action set; showing success UI (front-end only).");
      form.reset();
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: ((form.getAttribute("method") || "POST").toUpperCase()),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let payload = {};
      try {
        payload = await res.json();
      } catch (_) {}

      if (res.ok) {
        doneBox.style.display = "block";
        failBox.style.display = "none";
        const doneInner = doneBox.querySelector("div") || doneBox;
         doneInner.textContent = "Thanks! Your message was sent.";

        if (Array.isArray(payload?.msg)) {
          console.log("[contact] server msg:", payload.msg.join("\n"));
        } else {
          console.log("[contact] success:", payload);
        }

        form.reset();
      } else {
        const errorMsg = Array.isArray(payload?.msg)
          ? payload.msg.join("\n")
          : payload?.error || `Submission failed (${res.status}).`;
        doneBox.style.display = "none";
        failBox.style.display = "block";
        const failInner = failBox.querySelector("div") || failBox;
        failInner.textContent = errorMsg;
        console.warn("[contact] server error:", payload);
      }
    } catch (err) {
      console.error("[contact] Network error:", err);
      doneBox.style.display = "none";
      failBox.style.display = "block";
      failBox.textContent = "Network error submitting form. Please try again.";
    }
  });
});
