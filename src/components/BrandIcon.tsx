import type { ReactNode } from "react";

type BrandIconName =
  | "arrow-up-right"
  | "arrow-right"
  | "chevron-left"
  | "chevron-right"
  | "menu"
  | "check"
  | "plus"
  | "wrench"
  | "zalo"
  | "chat"
  | "send"
  | "clipboard"
  | "phone";

const paths: Record<BrandIconName, ReactNode> = {
  "arrow-up-right": (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  zalo: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.86 7.02-.17.95-.7 2.68-1.55 3.73-.13.16-.03.39.17.41 1.45.15 3.56-.37 5.07-1.42.8.17 1.62.26 2.45.26 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-1.8 11.8H7.4a.6.6 0 0 1-.6-.6v-.3c0-.33.27-.6.6-.6h1.7l-2.2-2.8a.6.6 0 0 1 .47-.9h2.7c.33 0 .6.27.6.6v.3c0 .33-.27.6-.6.6H8.9l2.2 2.8c.2.25.1.9-.9.9zm3.8 0h-1.6a.6.6 0 0 1-.6-.6V8.6c0-.33.27-.6.6-.6h1.6c1.2 0 2.1.8 2.1 2.4 0 1.5-.9 2.4-2.1 2.4zm0-1.2c.5 0 .9-.4.9-1.2 0-.8-.4-1.2-.9-1.2h-.4v2.4h.4z"
    />
  ),
  chat: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke="currentColor" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
};

export function BrandIcon({ name, className }: { name: BrandIconName; className?: string }) {
  const isFilled = name === "zalo";
  return (
    <svg
      className={className ? `brand-icon ${className}` : "brand-icon"}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={isFilled ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ width: "16px", height: "16px", display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {paths[name]}
    </svg>
  );
}