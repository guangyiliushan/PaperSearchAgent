/** @type {import("i18next-parser").UserConfig} */
module.exports = {
  locales: ["en", "zh-CN"],
  defaultNamespace: "common",
  defaultValue: "__STRING_NOT_TRANSLATED__",
  keyAsDefaultValue: true,
  keyAsDefaultValueForDerivedKeys: false,
  input: [
    // Scan apps and other packages from the perspective of packages/i18n
    "../../apps/**/*.{ts,tsx}",
    "../../packages/**/src/**/*.{ts,tsx}",
    // Exclude build artifacts and caches
    "!../../**/node_modules/**",
    "!../../**/.next/**",
    "!../../**/dist/**",
    "!../../**/.turbo/**",
  ],
  output: "src/locales/$LOCALE/$NAMESPACE.json",
  skipDefaultValues: true,
  sort: true,
}
