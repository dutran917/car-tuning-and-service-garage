import type { ReactNode } from "react";

type BrandIconName = "arrow-up-right" | "arrow-right" | "menu" | "check" | "plus";

const paths: Record<BrandIconName, ReactNode> = {
  "arrow-up-right": <><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
  "arrow-right": <><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
};

export function BrandIcon({ name, className }: { name: BrandIconName; className?: string }) {
  return <svg className={className ? `brand-icon ${className}` : "brand-icon"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
