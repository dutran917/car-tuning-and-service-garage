import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = { title: "Chỉnh sửa gói độ | Quản trị", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PackageAdminEditorPage() {
  return <div className="admin-shell"><AdminPanel /></div>;
}
