import type { Metadata } from "next";
import { createElement } from "react";
import { site } from "@/lib/site";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const canonical = `${site.url}${path}`;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical, siteName: `${site.name} – ${site.descriptor}`, locale: "vi_VN", type: "website" }, twitter: { card: "summary_large_image", title, description }, robots: { index: true, follow: true } };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return createElement("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") } });
}
