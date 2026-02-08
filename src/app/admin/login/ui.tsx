"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setMessage(payload?.error || "Login failed.");
        setStatus("error");
        return;
      }

      const nextPath = searchParams.get("from") || "/admin";
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setMessage("Unable to sign in right now.");
      setStatus("error");
    }
  };

  return (
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
        <img
          src="/images/logo.png"
          alt="Detail Geeks"
          style={{ width: "80px", height: "80px", objectFit: "contain" }}
        />
        <div
          style={{
            marginTop: "12px",
            fontSize: "1.4rem",
            fontWeight: 700,
          }}
        >
          Admin Login
        </div>
        <div style={{ color: "#5b647a", fontSize: "0.9rem" }}>
          Sign in to manage bookings and operations.
        </div>
      </div>

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
        <div>
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              style={{ width: "100%", background: "#f4f6fb", paddingRight: "44px" }}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                color: "#5b647a",
                fontSize: "0.8rem",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label style={{ textTransform: "none", letterSpacing: "0" }}>
            <input type="checkbox" style={{ marginRight: "8px" }} />
            Remember me
          </label>
          <a
            href="/admin/forgot-password"
            style={{ fontSize: "0.85rem", color: "#5b647a" }}
          >
            Forgot password?
          </a>
        </div>
        {message && (
          <div style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{message}</div>
        )}
        <button
          type="submit"
          className="admin-button primary"
          style={{ width: "100%" }}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
