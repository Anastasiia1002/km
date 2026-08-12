const ALLOWED_ORIGINS = [
  "https://km-trade.net",
  "https://www.km-trade.net",
  "https://anastasiia1002.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function getCorsOrigin(requestOrigin = "") {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  if (/^https:\/\/[a-z0-9-]+\.ngrok-free\.dev$/i.test(requestOrigin)) return requestOrigin;
  if (/^http:\/\/localhost:\d+$/i.test(requestOrigin)) return requestOrigin;
  return ALLOWED_ORIGINS[0];
}

export function applyCors(response, requestOrigin = "") {
  response.setHeader("Access-Control-Allow-Origin", getCorsOrigin(requestOrigin));
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, ngrok-skip-browser-warning");
  response.setHeader("Access-Control-Max-Age", "86400");
  response.setHeader("Vary", "Origin");
}

export function isValidUaPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return /^0\d{9}$/.test(digits) || /^380\d{9}$/.test(digits);
}

export function normalizeLead(payload = {}) {
  return {
    name: String(payload.name || "").trim().slice(0, 120),
    phone: String(payload.phone || "").trim().slice(0, 40),
    cars: String(payload.cars || "").trim().slice(0, 40),
    region: String(payload.region || "").trim().slice(0, 80),
    page: String(payload.page || "").trim().slice(0, 200),
    context: String(payload.context || "").trim().slice(0, 120),
    company_site: String(payload.company_site || "").trim(),
    utm_source: String(payload.utm_source || "").trim().slice(0, 120),
    utm_medium: String(payload.utm_medium || "").trim().slice(0, 120),
    utm_campaign: String(payload.utm_campaign || "").trim().slice(0, 120),
    utm_content: String(payload.utm_content || "").trim().slice(0, 120),
    utm_term: String(payload.utm_term || "").trim().slice(0, 120),
  };
}

export function validateLead(lead) {
  if (!lead.name) return "Вкажіть ім'я";
  if (!isValidUaPhone(lead.phone)) return "Некоректний телефон";
  return null;
}

export function sanitizeLead(lead) {
  return {
    name: lead.name,
    cars: lead.cars,
    region: lead.region,
    page: lead.page,
    context: lead.context,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
  };
}

function buildTelegramMessage(lead) {
  return [
    "Нова заявка з сайту КМ Трейд",
    "",
    `Ім'я: ${lead.name || "-"}`,
    `Телефон: ${lead.phone || "-"}`,
    `Кількість авто: ${lead.cars || "-"}`,
    `Регіон: ${lead.region || "-"}`,
    `Сторінка: ${lead.page || "-"}`,
    `Контекст CTA: ${lead.context || "-"}`,
    "",
    `utm_source: ${lead.utm_source || "-"}`,
    `utm_medium: ${lead.utm_medium || "-"}`,
    `utm_campaign: ${lead.utm_campaign || "-"}`,
    `utm_content: ${lead.utm_content || "-"}`,
    `utm_term: ${lead.utm_term || "-"}`,
  ].join("\n");
}

/**
 * Process a lead submission.
 * @returns {{ status: number, body: object }}
 */
export async function processLead(rawPayload, env = process.env) {
  const lead = normalizeLead(rawPayload);

  // Honeypot: pretend success, do not notify.
  if (lead.company_site) {
    return { status: 202, body: { ok: true } };
  }

  const validationError = validateLead(lead);
  if (validationError) {
    return { status: 400, body: { ok: false, error: validationError } };
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Lead received without Telegram env vars", sanitizeLead(lead));
    return { status: 202, body: { ok: true, warning: "Telegram is not configured" } };
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(lead),
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    const body = await telegramResponse.text();
    console.error("Telegram lead delivery failed", body);
    return { status: 502, body: { ok: false, error: "Telegram delivery failed" } };
  }

  return { status: 200, body: { ok: true } };
}
