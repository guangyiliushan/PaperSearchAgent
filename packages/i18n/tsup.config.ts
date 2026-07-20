import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: ["react", "i18next", "react-i18next"],
  clean: true,
  // Copy locale JSON files into dist so "./locales/*" exports resolve correctly
  onSuccess: 'copyfiles -u 1 "src/locales/**/*.json" dist/',
})
