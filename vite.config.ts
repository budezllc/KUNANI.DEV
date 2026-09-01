/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { injectPrerenderHtml } from "./src/lib/prerender.ts";

function prerenderHomeCatalog(): Plugin {
  return {
    name: "prerender-home-catalog",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return injectPrerenderHtml(html);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), prerenderHomeCatalog()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
