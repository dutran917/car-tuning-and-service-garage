import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer } from "@/components/SiteChrome";
import { ConsentBanner } from "@/components/ConsentBanner";
import { TrackingProvider } from "@/components/TrackingProvider";
import { FloatingContact } from "@/components/FloatingContact";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – Car Tuning & Service`, template: `%s | ${site.name}` },
  description: "Tư vấn concept, nâng cấp và thi công phụ kiện ô tô theo nhu cầu. Tập trung VinFast VF3, báo giá cấu hình sau khi xác nhận hạng mục.",
  applicationName: site.name,
  openGraph: {
    siteName: `${site.name} – ${site.descriptor}`,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name} – Car Tuning & Service`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  ...(process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18532353935" />
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-5QX78NCN" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-18532353935');`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Chuyển đến nội dung</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <FloatingContact />
        <ConsentBanner />
        <Suspense fallback={null}>
          <TrackingProvider />
        </Suspense>
      </body>
    </html>
  );
}
