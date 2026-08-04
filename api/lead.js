import { applyCors, processLead } from "../server/processLead.js";

function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string" && request.body.trim()) {
    try {
      return JSON.parse(request.body);
    } catch {
      return null;
    }
  }
  return {};
}

export default async function handler(request, response) {
  const origin = request.headers.origin || request.headers.Origin || "";
  applyCors(response, origin);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const payload = readJsonBody(request);
  if (payload == null) {
    return response.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const result = await processLead(payload, process.env);
  return response.status(result.status).json(result.body);
}
