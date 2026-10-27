"use client";
import { FormEvent, useState } from "react";
import { track } from "@/lib/tracking";

const upgradeOptions = ["Nội thất", "Ngoại thất / body kit", "Mâm / lốp", "Ánh sáng", "Màn hình / tiện nghi", "Cách âm", "Phụ kiện", "Tư vấn concept"];

export function LeadForm({ initialPackage = "" }: { initialPackage?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [leadId, setLeadId] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [started, setStarted] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    const requestKey = idempotencyKey || crypto.randomUUID();
    if (!idempotencyKey) setIdempotencyKey(requestKey);
    const values = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const analyticsConsent = (() => { try { return JSON.parse(localStorage.getItem("qda-consent") || "{}").analytics === true; } catch { return false; } })();
    const advertisingConsent = (() => { try { return JSON.parse(localStorage.getItem("qda-consent") || "{}").advertising === true; } catch { return false; } })();
    const touch = { landingPage: window.location.pathname, referrer: document.referrer || "", capturedAt: new Date().toISOString(), utm_source: params.get("utm_source"), utm_medium: params.get("utm_medium"), utm_campaign: params.get("utm_campaign"), utm_content: params.get("utm_content"), utm_term: params.get("utm_term"), gclid: params.get("gclid"), gbraid: params.get("gbraid"), wbraid: params.get("wbraid"), fbclid: params.get("fbclid") };
    const readStored = (key: string, fallback: unknown) => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : fallback; } catch { return fallback; } };
    const payload = { name: values.get("name"), phone: values.get("phone"), vehicle: values.get("vehicle"), upgrades: values.getAll("upgrades"), budget: values.get("budget"), notes: values.get("notes"), timing: values.get("timing"), preferredContact: values.get("preferredContact"), packageSlug: values.get("packageSlug"), website: values.get("website"), consent: values.get("consent") === "on", attribution: { firstTouch: readStored("qda-first-touch", touch), lastNonDirectTouch: readStored("qda-last-non-direct", touch), sessionTouch: readStored("qda-session-touch", touch), analyticsConsent, advertisingConsent } };
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Chưa gửi được yêu cầu. Vui lòng thử lại.");
      setLeadId(result.leadId); setMessage("Đã ghi nhận yêu cầu tư vấn."); setIdempotencyKey(""); form.reset();
      if (result.created) track({ event: "generate_lead", event_id: result.leadId, page_type: "quote", lead_id: result.leadId, ...(typeof payload.packageSlug === "string" && payload.packageSlug ? { package_id: payload.packageSlug } : {}) });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }
  return <form className="lead-form" onSubmit={submit} onFocus={() => { if (!started) { setStarted(true); track({ event: "form_start", page_type: "quote" }); } }}>
    <input type="hidden" name="packageSlug" value={initialPackage} />
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="form-grid"><label>Họ và tên <em>*</em><input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Tên của bạn" /></label><label>Số điện thoại <em>*</em><input name="phone" required inputMode="tel" autoComplete="tel" minLength={9} maxLength={15} placeholder="Số điện thoại liên hệ" /></label><label>Dòng xe / phiên bản <em>*</em><input name="vehicle" required maxLength={120} defaultValue={initialPackage ? "VinFast VF3" : ""} placeholder="Ví dụ: VinFast VF3 Plus" /></label><label>Ngân sách dự kiến<select name="budget" defaultValue=""><option value="">Chọn khoảng ngân sách</option><option>Dưới 30 triệu</option><option>30–60 triệu</option><option>60–120 triệu</option><option>120–200 triệu</option><option>Trên 200 triệu</option><option>Cần tư vấn thêm</option></select></label></div>
    <fieldset><legend>Hạng mục bạn quan tâm</legend><div className="check-grid">{upgradeOptions.map((item) => <label className="check-option" key={item}><input type="checkbox" name="upgrades" value={item} />{item}</label>)}</div></fieldset>
    <div className="form-grid"><label>Thời điểm dự kiến<select name="timing" defaultValue=""><option value="">Chưa xác định</option><option>Càng sớm càng tốt</option><option>Trong 2–4 tuần</option><option>Trong 1–3 tháng</option><option>Đang tham khảo</option></select></label><label>Kênh liên hệ mong muốn<select name="preferredContact"><option>Điện thoại</option><option>Zalo</option><option>Facebook</option></select></label></div>
    <label>Mô tả nhu cầu / phong cách<textarea name="notes" rows={4} maxLength={2000} placeholder="Bạn muốn chiếc xe thay đổi như thế nào?" /></label>
    <label className="privacy-check"><input name="consent" type="checkbox" required />Tôi đồng ý để Quốc Dương Auto sử dụng thông tin này nhằm liên hệ tư vấn theo <a href="/quyen-rieng-tu">Chính sách quyền riêng tư</a>. <em>*</em></label>
    <button className="button submit-button" type="submit" disabled={busy}>{busy ? "Đang gửi yêu cầu…" : "Gửi yêu cầu tư vấn"}<span>↗</span></button>
    {message && <p className={leadId ? "form-success" : "form-error"} role="status">{message}{leadId && <><br /><small>Mã yêu cầu: {leadId}</small></>}</p>}
    <p className="form-note">Thông tin chỉ được dùng để phản hồi yêu cầu của bạn. Vui lòng không ghi dữ liệu thanh toán hoặc thông tin nhạy cảm.</p>
  </form>;
}
