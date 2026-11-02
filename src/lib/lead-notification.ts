type LeadNotification = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  upgrades: string[];
  budget: string;
  notes: string;
  timing: string;
  preferredContact: string;
  packageSlug: string | null;
};

const TARGET_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL || "ductcp@gmail.com";

export async function sendLeadNotification(lead: LeadNotification) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://quocduong-auto.com").replace(/\/$/, "");
  const packageUrl = lead.packageSlug
    ? `${siteUrl}/goi-do/${encodeURIComponent(lead.packageSlug)}`
    : "Tư vấn tổng quan (chưa chọn gói cụ thể)";

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const zaloCustomerLink = `https://zalo.me/${cleanPhone}`;
  const nowStr = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const lines = [
    "🔥 CÓ YÊU CẦU TƯ VẤN CẤU HÌNH ĐỘ XE MỚI",
    "----------------------------------------",
    `Mã tham chiếu: #${lead.id}`,
    `Khách hàng: ${lead.name}`,
    `Số điện thoại: ${lead.phone}`,
    `Zalo khách: ${zaloCustomerLink}`,
    `Dòng xe: ${lead.vehicle}`,
    `Gói độ quan tâm: ${packageUrl}`,
    `Hạng mục quan tâm: ${lead.upgrades.length ? lead.upgrades.join(", ") : "Chưa chọn"}`,
    `Ngân sách dự kiến: ${lead.budget || "Chưa cung cấp"}`,
    `Thời điểm dự kiến: ${lead.timing || "Chưa xác định"}`,
    `Kênh ưu tiên liên hệ: ${lead.preferredContact || "Điện thoại / Zalo"}`,
    `Mô tả nhu cầu: ${lead.notes || "Không có"}`,
    "----------------------------------------",
    `Thời gian gửi: ${nowStr}`,
  ];

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #161817; color: #f0f0ed; border-radius: 8px; overflow: hidden; border: 1px solid #313634;">
      <div style="background: #f26a32; padding: 20px 24px; color: #111;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Quốc Dương Auto · Yêu cầu tư vấn mới</h2>
        <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; opacity: 0.9;">Mã yêu cầu: #${lead.id}</p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; width: 140px; vertical-align: top;">Khách hàng:</td>
            <td style="padding: 8px 0; color: #fff; font-weight: 700; font-size: 16px;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Số điện thoại:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${lead.phone}" style="color: #f26a32; font-weight: 700; font-size: 16px; text-decoration: none;">${lead.phone}</a>
              <span style="color: #666; margin: 0 8px;">|</span>
              <a href="${zaloCustomerLink}" style="color: #0068ff; text-decoration: underline; font-weight: 600;">Chat Zalo khách</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Dòng xe:</td>
            <td style="padding: 8px 0; color: #fff; font-weight: 600;">${lead.vehicle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Gói quan tâm:</td>
            <td style="padding: 8px 0;">
              ${lead.packageSlug ? `<a href="${packageUrl}" style="color: #f26a32; text-decoration: underline;">${lead.packageSlug}</a>` : '<span style="color: #bbb;">Tư vấn chung</span>'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Hạng mục:</td>
            <td style="padding: 8px 0; color: #ddd;">${lead.upgrades.length ? lead.upgrades.join(", ") : "Chưa chọn"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Ngân sách:</td>
            <td style="padding: 8px 0; color: #ffd166; font-weight: 600;">${lead.budget || "Chưa cung cấp"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Thời điểm:</td>
            <td style="padding: 8px 0; color: #ddd;">${lead.timing || "Chưa xác định"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Kênh liên hệ:</td>
            <td style="padding: 8px 0; color: #ddd;">${lead.preferredContact || "Điện thoại / Zalo"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9aa09a; vertical-align: top;">Ghi chú nhu cầu:</td>
            <td style="padding: 8px 0; color: #fff; background: #202422; padding: 12px; border-radius: 4px; white-space: pre-wrap;">${lead.notes || "Không có"}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #2b302e; text-align: center;">
          <a href="tel:${lead.phone}" style="display: inline-block; background: #f26a32; color: #111; font-weight: 800; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-right: 12px;">Gọi điện ngay</a>
          <a href="${zaloCustomerLink}" style="display: inline-block; background: #0068ff; color: #fff; font-weight: 800; padding: 12px 24px; border-radius: 4px; text-decoration: none;">Mở Zalo khách</a>
        </div>
      </div>
    </div>
  `;

  // 1. FormSubmit API (Direct email relay to ductcp@gmail.com when form is SUBMITTED)
  try {
    const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TARGET_EMAIL)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Referer": siteUrl,
      },
      body: JSON.stringify({
        _subject: `🔥 YÊU CẦU TƯ VẤN ĐỘ XE MỚI · ${lead.name} (${lead.vehicle})`,
        _template: "table",
        _captcha: "false",
        "Khách hàng": lead.name,
        "Số điện thoại": lead.phone,
        "Zalo khách": zaloCustomerLink,
        "Dòng xe": lead.vehicle,
        "Gói độ quan tâm": packageUrl,
        "Hạng mục quan tâm": lead.upgrades.length ? lead.upgrades.join(", ") : "Chưa chọn",
        "Ngân sách dự kiến": lead.budget || "Chưa cung cấp",
        "Thời điểm dự kiến": lead.timing || "Chưa xác định",
        "Kênh ưu tiên liên hệ": lead.preferredContact || "Điện thoại / Zalo",
        "Nội dung / Nhu cầu": lead.notes || "Không có",
        "Mã yêu cầu": `#${lead.id}`,
        "Thời gian gửi": nowStr,
      }),
    });
    const fsJson = await fsRes.json().catch(() => null);
    console.log(`[LEAD NOTIFICATION] Đã gửi FormSubmit tới ${TARGET_EMAIL}:`, fsJson?.message || fsRes.status);
  } catch (fsErr) {
    console.error("[LEAD NOTIFICATION] FormSubmit gửi lỗi:", fsErr);
  }

  // 2. Resend API (if configured)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `lead-notification-${lead.id}`,
        },
        body: JSON.stringify({
          from: process.env.LEAD_NOTIFICATION_FROM || "Quoc Duong Auto <onboarding@resend.dev>",
          to: [TARGET_EMAIL],
          subject: `🔥 Yêu cầu tư vấn độ xe mới · ${lead.name} (${lead.vehicle})`,
          text: lines.join("\n"),
          html: htmlContent,
        }),
      });
    } catch (err) {
      console.error("resend_fetch_error", err);
    }
  }

  // 3. Telegram Bot Notification (if configured)
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      const tgText = `🔥 <b>CÓ KHÁCH ĐẶT TƯ VẤN CẤU HÌNH ĐỘ XE</b>\n\n` +
        `👤 <b>Khách hàng:</b> ${lead.name}\n` +
        `📞 <b>Số điện thoại:</b> <code>${lead.phone}</code>\n` +
        `🚘 <b>Dòng xe:</b> ${lead.vehicle}\n` +
        `💰 <b>Ngân sách:</b> ${lead.budget || "Chưa cung cấp"}\n` +
        `🛠 <b>Hạng mục:</b> ${lead.upgrades.length ? lead.upgrades.join(", ") : "Chưa chọn"}\n` +
        `📝 <b>Ghi chú:</b> ${lead.notes || "Không có"}\n\n` +
        `👉 <a href="${zaloCustomerLink}">Bấm để mở Zalo chat với khách</a>`;

      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: tgText,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("telegram_notification_failed", err);
    }
  }
}
