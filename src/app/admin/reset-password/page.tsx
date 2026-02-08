"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!token || !email) {
      setMessage("Missing reset token.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/admin/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error || "Unable to reset password.");
        setStatus("idle");
        return;
      }

      setStatus("done");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1200);
    } catch (error) {
      setMessage("Unable to reset password.");
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
            Set a new password
          </div>
          <div style={{ color: "#5b647a", fontSize: "0.9rem" }}>
            Create a strong password for {email || "your account"}.
          </div>
        </div>

        {status === "done" ? (
          <div style={{ color: "#0f766e", fontSize: "0.95rem" }}>
            Password updated. Redirecting to login...
          </div>
        ) : (
          <form className="admin-form" onSubmit={handleSubmit}>
            <div>
              <label>New password</label>
              <input
                type="password"
                placeholder="••••••••"
                style={{ width: "100%", background: "#f4f6fb" }}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="••••••••"
                style={{ width: "100%", background: "#f4f6fb" }}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                minLength={8}
              />
            </div>
            {message && (
              <div style={{ color: "#b91c1c", fontSize: "0.85rem" }}>
                {message}
              </div>
            )}
            <button
              className="admin-button primary"
              style={{ width: "100%" }}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
