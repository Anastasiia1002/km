import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE || "/km/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
