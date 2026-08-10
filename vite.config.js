import react from "@vitejs/plugin-react";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { applyCors, processLead } from "./server/processLead.js";

function leadApiPlugin() {
  return {
    name: "km-lead-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (url !== "/api/lead" && url !== "/km/api/lead") return next();

        const origin = req.headers.origin || "";
        const fakeResponse = {
          statusCode: 200,
          headers: {},
          setHeader(key, value) {
            this.headers[key] = value;
            res.setHeader(key, value);
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(body) {
            res.statusCode = this.statusCode;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(body));
          },
          end() {
            res.statusCode = this.statusCode;
            res.end();
          },
        };

        applyCors(fakeResponse, origin);

        if (req.method === "OPTIONS") {
          fakeResponse.status(204).end();
          return;
        }

        if (req.method !== "POST") {
          fakeResponse.setHeader("Allow", "POST, OPTIONS");
          fakeResponse.status(405).json({ ok: false, error: "Method not allowed" });
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString("utf8");
          let payload = {};
          if (raw.trim()) {
            try {
              payload = JSON.parse(raw);
            } catch {
              fakeResponse.status(400).json({ ok: false, error: "Invalid JSON body" });
              return;
            }
          }

          const env = { ...process.env, ...loadEnv(server.config.mode, process.cwd(), "") };
          const result = await processLead(payload, env);
          fakeResponse.status(result.status).json(result.body);
        } catch (error) {
          console.error("Local /api/lead failed", error);
          fakeResponse.status(500).json({ ok: false, error: "Internal error" });
        }
      });
    },
  };
}

function stripPortalSecretsPlugin() {
  return {
    name: "km-strip-portal-secrets",
    closeBundle() {
      const secretPath = path.resolve("dist/client-nexus-portal/config.local.php");
      if (existsSync(secretPath)) {
        rmSync(secretPath);
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE || "/km/",
  plugins: [react(), leadApiPlugin(), stripPortalSecretsPlugin()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
