"use client";

export function CookieSettingsButton() {
  return <button className="cookie-settings" type="button" onClick={() => { localStorage.setItem("qda-consent-open", "1"); window.dispatchEvent(new Event("qda-consent-changed")); }}>Cài đặt cookie</button>;
}
