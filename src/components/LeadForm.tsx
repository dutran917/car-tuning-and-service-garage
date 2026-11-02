"use client";
import { FormEvent, useState } from "react";
import { track } from "@/lib/tracking";
import { BrandIcon } from "@/components/BrandIcon";

const upgradeOptions = [
  "Nội thất",
  "Ngoại thất / body kit",
  "Mâm / lốp",
  "Ánh sáng",
  "Màn hình / tiện nghi",
  "Cách âm",
  "Phụ kiện",
  "Tư vấn concept",
];

type PackageInfo = {
  slug: string;
  name: string;
  vehicle: string;
};

export function LeadForm({
  initialPackage = "",
  packageData = null,
}: {
  initialPackage?: string;
  packageData?: PackageInfo | null;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [leadId, setLeadId] = useState("");
  const [zaloMessage, setZaloMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [started, setStarted] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState("");

  const defaultVehicle = packageData?.vehicle || (initialPackage ? "VinFast VF3" : "");
  const activePackageSlug = packageData?.slug || initialPackage || "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const requestKey = idempotencyKey || crypto.randomUUID();
    if (!idempotencyKey) setIdempotencyKey(requestKey);
    const values = new FormData(form);
    const customerName = String(values.get("name") || "").trim();
    const customerPhone = String(values.get("phone") || "").trim();
    setSubmittedPhone(customerPhone);
    const vehicle = String(values.get("vehicle") || "").trim();
    const packageSlug = String(values.get("packageSlug") || "").trim();
    const packageName = packageData?.name || (packageSlug ? packageSlug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Tư vấn cấu hình");
    const packageUrl = packageSlug ? `${window.location.origin}/goi-do/${packageSlug}` : window.location.href;

    const preparedMessage = [
      "Xin chào Quốc Dương Auto, tôi muốn được tư vấn cấu hình xe.",
      `Họ tên: ${customerName}`,
      `Số điện thoại: ${customerPhone}`,
      `Dòng xe: ${vehicle}`,
      `Gói độ quan tâm: ${packageName}`,
      `Link tham khảo: ${packageUrl}`,
      values.getAll("upgrades").length ? `Hạng mục quan tâm: ${values.getAll("upgrades").join(", ")}` : "",
      values.get("budget") ? `Ngân sách dự kiến: ${values.get("budget")}` : "",
      values.get("timing") ? `Thời điểm dự kiến: ${values.get("timing")}` : "",
      values.get("notes") ? `Mô tả nhu cầu: ${String(values.get("notes")).trim()}` : "",
    ].filter(Boolean).join("\n");

    const params = new URLSearchParams(window.location.search);
    const analyticsConsent = (() => {
      try {
        return JSON.parse(localStorage.getItem("qda-consent") || "{}").analytics === true;
      } catch {
        return false;
      }
    })();
    const advertisingConsent = (() => {
      try {
        return JSON.parse(localStorage.getItem("qda-consent") || "{}").advertising === true;
      } catch {
        return false;
      }
    })();
    const touch = {
      landingPage: window.location.pathname,
      referrer: document.referrer || "",
      capturedAt: new Date().toISOString(),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      gclid: params.get("gclid"),
      gbraid: params.get("gbraid"),
      wbraid: params.get("wbraid"),
      fbclid: params.get("fbclid"),
    };
    const readStored = (key: string, fallback: unknown) => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
      } catch {
        return fallback;
      }
    };
    const payload = {
      name: values.get("name"),
      phone: values.get("phone"),
      vehicle: values.get("vehicle"),
      upgrades: values.getAll("upgrades"),
      budget: values.get("budget"),
      notes: values.get("notes"),
      timing: values.get("timing"),
      preferredContact: values.get("preferredContact"),
      packageSlug: values.get("packageSlug"),
      website: values.get("website"),
      consent: values.get("consent") === "on",
      attribution: {
        firstTouch: readStored("qda-first-touch", touch),
        lastNonDirectTouch: readStored("qda-last-non-direct", touch),
        sessionTouch: readStored("qda-session-touch", touch),
        analyticsConsent,
        advertisingConsent,
      },
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": requestKey },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Chưa gửi được yêu cầu. Vui lòng thử lại.");
      setLeadId(result.leadId);
      setMessage("Yêu cầu tư vấn của bạn đã được gửi thành công!");
      setZaloMessage(preparedMessage);
      setCopyMessage("Đã sao chép nội dung tin nhắn!");
      setIdempotencyKey("");
      form.reset();

      // Automatically copy to clipboard for quick Zalo chat
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(preparedMessage);
        }
      } catch {}

      if (result.created) {
        track({
          event: "generate_lead",
          event_id: result.leadId,
          page_type: "quote",
          lead_id: result.leadId,
          ...(typeof payload.packageSlug === "string" && payload.packageSlug ? { package_id: payload.packageSlug } : {}),
        });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="lead-form"
      onSubmit={submit}
      onFocus={() => {
        if (!started) {
          setStarted(true);
          track({ event: "form_start", page_type: "quote" });
        }
      }}
    >
      <input type="hidden" name="packageSlug" value={activePackageSlug} />
      <label className="honeypot" aria-hidden="true">
        Website<input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {packageData && (
        <div className="lead-package-banner">
          <span className="banner-tag">GÓI ĐANG XEM</span>
          <span className="banner-title">{packageData.name} ({packageData.vehicle})</span>
        </div>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span className="field-label">Họ và tên <em>*</em></span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Tên của bạn"
          />
        </label>
        <label className="form-field">
          <span className="field-label">Số điện thoại <em>*</em></span>
          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            minLength={9}
            maxLength={15}
            placeholder="Ví dụ: 0987654321"
          />
        </label>
        <label className="form-field">
          <span className="field-label">Dòng xe / phiên bản <em>*</em></span>
          <input
            name="vehicle"
            required
            maxLength={120}
            defaultValue={defaultVehicle}
            placeholder="Ví dụ: VinFast VF3, VF7, Mazda 3..."
          />
        </label>
        <label className="form-field">
          <span className="field-label">Ngân sách dự kiến</span>
          <select name="budget" defaultValue="">
            <option value="">Chọn khoảng ngân sách</option>
            <option>Dưới 30 triệu</option>
            <option>30–60 triệu</option>
            <option>60–120 triệu</option>
            <option>120–200 triệu</option>
            <option>Trên 200 triệu</option>
            <option>Cần tư vấn thêm</option>
          </select>
        </label>
      </div>

      <fieldset className="form-fieldset">
        <legend className="field-label">Hạng mục bạn quan tâm</legend>
        <div className="check-grid">
          {upgradeOptions.map((item) => (
            <label className="check-option" key={item}>
              <input type="checkbox" name="upgrades" value={item} />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-grid">
        <label className="form-field">
          <span className="field-label">Thời điểm dự kiến</span>
          <select name="timing" defaultValue="">
            <option value="">Chưa xác định</option>
            <option>Càng sớm càng tốt</option>
            <option>Trong 2–4 tuần</option>
            <option>Trong 1–3 tháng</option>
            <option>Đang tham khảo</option>
          </select>
        </label>
        <label className="form-field">
          <span className="field-label">Kênh liên hệ mong muốn</span>
          <select name="preferredContact" defaultValue="Điện thoại">
            <option>Điện thoại</option>
            <option>Zalo</option>
            <option>Facebook</option>
          </select>
        </label>
      </div>

      <label className="form-field">
        <span className="field-label">Mô tả nhu cầu / phong cách</span>
        <textarea
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="Bạn muốn chiếc xe thay đổi như thế nào? (VD: độ body kit, nâng cấp màn hình, dán cách âm...)"
        />
      </label>

      <label className="privacy-check">
        <input name="consent" type="checkbox" required />
        <span>
          Tôi đồng ý để Quốc Dương Auto sử dụng thông tin này nhằm liên hệ tư vấn theo{" "}
          <a href="/quyen-rieng-tu" target="_blank">Chính sách quyền riêng tư</a>. <em>*</em>
        </span>
      </label>

      <button className="button submit-button" type="submit" disabled={busy}>
        {busy ? "Đang gửi yêu cầu…" : "Gửi yêu cầu tư vấn"}
        <BrandIcon name="arrow-up-right" />
      </button>

      {message && (
        leadId ? (
          <div className="form-success-card" role="status">
            <div className="form-success-header">
              <span className="success-badge"><BrandIcon name="check"/> ĐÃ TIẾP NHẬN YÊU CẦU</span>
              <h3>{message}</h3>
              <p>
                Thông tin cấu hình xe đã được gửi trực tiếp đến quản lý Quốc Dương Auto (ductcp@gmail.com). Kỹ thuật viên sẽ liên hệ lại qua số: <strong>{submittedPhone}</strong> trong thời gian sớm nhất.
              </p>
            </div>
            <div className="lead-quick-actions">
              <a
                className="button zalo-action-btn"
                href="https://zalo.me/0399513456"
                target="_blank"
                rel="noreferrer"
                data-track="zalo"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(zaloMessage);
                  } catch {}
                }}
              >
                Chat Zalo với gara (0399.513.456) <BrandIcon name="arrow-up-right"/>
              </a>
              <a className="button button-outline phone-action-btn" href="tel:0399513456" data-track="phone">
                Gọi Hotline: 0399.513.456 <BrandIcon name="arrow-up-right"/>
              </a>
            </div>
            <details className="zalo-optional-details">
              <summary>Xem lại nội dung yêu cầu đã gửi</summary>
              <textarea className="zalo-message-preview" aria-label="Nội dung đã gửi" readOnly value={zaloMessage} rows={5} />
              <div className="zalo-handoff-actions">
                <button
                  className="button button-small"
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(zaloMessage);
                      setCopyMessage("Đã sao chép nội dung!");
                    } catch {
                      setCopyMessage("Không thể tự sao chép.");
                    }
                  }}
                >
                  {copyMessage.startsWith("Đã") ? <>Đã sao chép <BrandIcon name="check"/></> : "Sao chép tin nhắn"}
                </button>
              </div>
            </details>
            <small className="lead-ref-id">Mã yêu cầu: #{leadId}</small>
          </div>
        ) : (
          <div className="form-error" role="status">{message}</div>
        )
      )}
      <p className="form-note">
        Thông tin chỉ được dùng để phản hồi yêu cầu của bạn. Vui lòng không ghi dữ liệu thanh toán hoặc thông tin nhạy cảm.
      </p>
    </form>
  );
}