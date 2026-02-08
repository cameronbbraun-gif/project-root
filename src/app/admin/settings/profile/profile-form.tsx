"use client";

import { useEffect, useState } from "react";
import SignOutButton from "./SignOutButton";

type ProfileData = {
  name: string | null;
  email: string | null;
  role: string;
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setProfile(data);
        setDraft({
          name: data.name || "",
          email: data.email || "",
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = async () => {
    if (!editing) {
      setEditing(true);
      setMessage(null);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          email: draft.email,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error || "Unable to save profile.");
        setSaving(false);
        return;
      }

      setProfile(payload);
      setDraft({ name: payload.name || "", email: payload.email || "" });
      setEditing(false);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage("Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordMessage(null);

    if (passwordDraft.newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setPasswordMessage(payload?.error || "Unable to change password.");
        setPasswordSaving(false);
        return;
      }

      setPasswordMessage("Password updated.");
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordMessage("Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Profile
          <span>Update profile details and admin preferences.</span>
        </div>
        <div className="admin-actions">
          <button
            className="admin-button"
            onClick={() => {
              setShowPasswordForm((prev) => !prev);
              setPasswordMessage(null);
            }}
          >
            Change Password
          </button>
          <button
            className="admin-button primary"
            onClick={handleToggle}
            disabled={saving}
          >
            {editing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
          </button>
          <SignOutButton />
        </div>
      </section>

      <section className="admin-grid cols-2">
        <div className="admin-card">
          <h3>Profile Details</h3>
          <div className="admin-form">
            <div>
              <label>Full name</label>
              <input
                value={editing ? draft.name : profile?.name || ""}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                disabled={!editing}
              />
            </div>
            <div>
              <label>Email address</label>
              <input
                value={editing ? draft.email : profile?.email || ""}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, email: event.target.value }))
                }
                disabled={!editing}
              />
            </div>
            <div>
              <label>Role</label>
              <input value={profile?.role || "admin"} disabled />
            </div>
            {message && (
              <div style={{ fontSize: "0.85rem", color: "#0f766e" }}>
                {message}
              </div>
            )}
          </div>
        </div>
        <div className="admin-card">
          <h3>Preferences</h3>
          <div className="admin-form">
            <div>
              <label>Default view</label>
              <select defaultValue="dashboard" disabled={!editing}>
                <option value="dashboard">Dashboard</option>
                <option value="calendar">Calendar</option>
                <option value="bookings">Bookings</option>
              </select>
            </div>
            <div>
              <label>Time zone</label>
              <input defaultValue="America/New_York" disabled={!editing} />
            </div>
            <div>
              <label>Notification sound</label>
              <input defaultValue="Soft chime" disabled={!editing} />
            </div>
          </div>
        </div>
      </section>
      {showPasswordForm && (
        <section className="admin-card">
          <h3>Change Password</h3>
          <div className="admin-form">
            <div>
              <label>Current password</label>
              <input
                type="password"
                value={passwordDraft.currentPassword}
                onChange={(event) =>
                  setPasswordDraft((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label>New password</label>
              <input
                type="password"
                value={passwordDraft.newPassword}
                onChange={(event) =>
                  setPasswordDraft((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label>Confirm new password</label>
              <input
                type="password"
                value={passwordDraft.confirmPassword}
                onChange={(event) =>
                  setPasswordDraft((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>
            {passwordMessage && (
              <div style={{ fontSize: "0.85rem", color: "#0f766e" }}>
                {passwordMessage}
              </div>
            )}
            <button
              className="admin-button primary"
              style={{ width: "100%" }}
              onClick={handlePasswordSubmit}
              disabled={passwordSaving}
            >
              {passwordSaving ? "Updating..." : "Save Password"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
