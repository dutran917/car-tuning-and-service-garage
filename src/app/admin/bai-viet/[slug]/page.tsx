import type { Metadata } from "next";
import { ArticleAdmin } from "@/components/ArticleAdmin";

export const metadata: Metadata = { title: "Chỉnh sửa bài viết | Quản trị", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ArticleAdminEditorPage() {
  return <div className="admin-shell"><ArticleAdmin /></div>;
}
