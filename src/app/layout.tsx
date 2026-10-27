import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer } from "@/components/SiteChrome";
import { ConsentBanner } from "@/components/ConsentBanner";
import { TrackingProvider } from "@/components/TrackingProvider";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = { metadataBase: new URL(site.url), title: { default: `${site.name} – Car Tuning & Service`, template: `%s | ${site.name}` }, description: "Tư vấn concept, nâng cấp và thi công phụ kiện ô tô theo nhu cầu. Tập trung VinFast VF3, báo giá cấu hình sau khi xác nhận hạng mục.", applicationName: site.name, openGraph: { siteName: `${site.name} – ${site.descriptor}`, locale: "vi_VN", type: "website" }, ...(process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION } } : {}) };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body><a className="skip-link" href="#main-content">Chuyển đến nội dung</a><Header/><main id="main-content">{children}</main><Footer/><ConsentBanner/><Suspense fallback={null}><TrackingProvider/></Suspense></body></html>; }
