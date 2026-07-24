/**
 * Serverless proxy для AI-агента.
 *
 * Розробник повинен надати змінні середовища (див. README):
 * - AI_AGENT_API_URL  — URL API агента (OpenAI-compatible chat/completions або кастомний webhook)
 * - AI_AGENT_API_KEY  — ключ авторизації (Bearer)
 * - AI_AGENT_MODEL    — (опційно) назва моделі, якщо потрібна провайдеру
 * - AI_AGENT_SYSTEM   — (опційно) system prompt для агента
 *
 * Підтримувані формати відповіді upstream:
 * 1) OpenAI Chat Completions: { choices: [{ message: { content } }] }
 * 2) Простий JSON: { reply } | { message } | { answer } | { text }
 * 3) Plain text
 */
export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiUrl = process.env.AI_AGENT_API_URL;
  const apiKey = process.env.AI_AGENT_API_KEY;

  if (!apiUrl || !apiKey) {
    return response.status(503).json({
      ok: false,
      error: "AI agent is not configured",
      reply:
        "AI-агент ще не підключений. Залиште заявку на сайті або зателефонуйте — менеджер відповість особисто.",
    });
  }

  const payload = request.body || {};
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const lastUser = [...messages].reverse().find((item) => item?.role === "user");

  if (!lastUser?.content || typeof lastUser.content !== "string") {
    return response.status(400).json({ ok: false, error: "Message is required" });
  }

  if (lastUser.content.length > 2000) {
    return response.status(400).json({ ok: false, error: "Message is too long" });
  }

  const systemPrompt =
    process.env.AI_AGENT_SYSTEM ||
    "Ти AI-консультант компанії КМ Трейд (GPS-моніторинг транспорту на Wialon, Західна Україна). Відповідай українською, коротко і по суті. Не вигадуй точні ціни, якщо їх немає в контексті — запропонуй залишити заявку або зателефонувати.";

  const model = process.env.AI_AGENT_MODEL || "gpt-4o-mini";
  const mode = (process.env.AI_AGENT_MODE || "openai").toLowerCase();

  const sanitizedHistory = messages
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-20)
    .map(({ role, content }) => ({ role, content: String(content).slice(0, 2000) }));

  try {
    let upstreamBody;
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    if (mode === "webhook") {
      upstreamBody = {
        messages: sanitizedHistory,
        sessionId: payload.sessionId || null,
        page: payload.page || null,
        system: systemPrompt,
      };
    } else {
      upstreamBody = {
        model,
        messages: [{ role: "system", content: systemPrompt }, ...sanitizedHistory],
        temperature: 0.4,
      };
    }

    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
    });

    const contentType = upstream.headers.get("content-type") || "";
    const raw = await upstream.text();

    if (!upstream.ok) {
      console.error("AI agent upstream error", upstream.status, raw.slice(0, 500));
      return response.status(502).json({
        ok: false,
        error: "AI agent request failed",
        reply: "Тимчасово не можу відповісти. Спробуйте ще раз або залиште заявку на сайті.",
      });
    }

    const reply = extractReply(raw, contentType);
    if (!reply) {
      console.error("AI agent returned empty reply", raw.slice(0, 500));
      return response.status(502).json({
        ok: false,
        error: "Empty AI reply",
        reply: "Тимчасово не можу відповісти. Спробуйте ще раз або залиште заявку на сайті.",
      });
    }

    return response.status(200).json({ ok: true, reply });
  } catch (error) {
    console.error("AI agent proxy failed", error);
    return response.status(502).json({
      ok: false,
      error: "AI agent proxy failed",
      reply: "Тимчасово не можу відповісти. Спробуйте ще раз або залиште заявку на сайті.",
    });
  }
}

function extractReply(raw, contentType) {
  if (!raw) return "";

  if (!contentType.includes("application/json")) {
    return raw.trim();
  }

  try {
    const data = JSON.parse(raw);
    const fromChoices = data?.choices?.[0]?.message?.content;
    if (typeof fromChoices === "string" && fromChoices.trim()) return fromChoices.trim();

    for (const key of ["reply", "message", "answer", "text", "output"]) {
      if (typeof data?.[key] === "string" && data[key].trim()) return data[key].trim();
    }

    if (typeof data?.data?.reply === "string") return data.data.reply.trim();
    return "";
  } catch {
    return raw.trim();
  }
}
