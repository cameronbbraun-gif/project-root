import AdminLoginForm from "./ui";

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
      <AdminLoginForm />
    </div>
  );
}
