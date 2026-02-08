import AdminLoginForm from "./ui";
import { Suspense } from "react";

export default function AdminLoginPage() {
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
      <Suspense fallback={<div />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
