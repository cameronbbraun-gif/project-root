"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error || "Unable to send reset email.");
        setStatus("idle");
        return;
      }

      setStatus("sent");
    } catch (error) {
      setMessage("Unable to send reset email.");
      setStatus("idle");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4f6fb",
        padding: "24px",
      }}
    >
      <div
        className="admin-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "28px",
          background: "#ffffff",
          border: "1px solid #e5e9f2",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
            Reset your password
          </div>
          <div style={{ color: "#5b647a", fontSize: "0.9rem" }}>
            We'll email you a secure reset link.
          </div>
        </div>

        {status === "sent" ? (
          <div style={{ color: "#0f766e", fontSize: "0.95rem" }}>
            If an account exists for that email, a reset link has been sent.
          </div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@detailgeeks.com"
                style={{ width: "100%", background: "#f4f6fb" }}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {message && (
              <div style={{ color: "#b91c1c", fontSize: "0.85rem" }}>
                {message}
              </div>
            )}
            <button className="admin-button primary" style={{ width: "100%" }}>
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
