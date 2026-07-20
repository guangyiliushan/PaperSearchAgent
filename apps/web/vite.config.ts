import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Dev: resolve @repo/i18n to source so we don't need a pre-build step.
      // Production builds use the package.json "exports" field (-> dist/) via Turborepo's ^build.
      "@repo/i18n": path.resolve(__dirname, "../../packages/i18n/src/index.ts"),
    },
  },
})
