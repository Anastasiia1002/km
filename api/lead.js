export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const payload = request.body || {};
  if (payload.company_site) {
    return response.status(202).json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Lead received without Telegram env vars", sanitize(payload));
    return response.status(202).json({ ok: true, warning: "Telegram is not configured" });
  }

  const message = [
    "Нова заявка з сайту КМ-Трейд",
    "",
    `Ім'я: ${payload.name || "-"}`,
    `Телефон: ${payload.phone || "-"}`,
    `Кількість авто: ${payload.cars || "-"}`,
    `Регіон: ${payload.region || "-"}`,
    `Економія з калькулятора: ${payload.savings || "-"}`,
    `Сторінка: ${payload.page || "-"}`,
    "",
    `utm_source: ${payload.utm_source || "-"}`,
    `utm_medium: ${payload.utm_medium || "-"}`,
    `utm_campaign: ${payload.utm_campaign || "-"}`,
    `utm_content: ${payload.utm_content || "-"}`,
    `utm_term: ${payload.utm_term || "-"}`,
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    const body = await telegramResponse.text();
    console.error("Telegram lead delivery failed", body);
    return response.status(502).json({ ok: false, error: "Telegram delivery failed" });
  }

  return response.status(200).json({ ok: true });
}

function sanitize(payload) {
  return {
    name: payload.name,
    cars: payload.cars,
    region: payload.region,
    page: payload.page,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
  };
}
