import "./admin.css";
import AdminShell from "./components/AdminShell";

export const metadata = {
  title: "Admin Panel | Detail Geeks",
  description: "Detail Geeks admin dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
