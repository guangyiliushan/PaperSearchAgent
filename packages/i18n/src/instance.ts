import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import zhCNCommon from "./locales/zh-CN/common.json"

export const resources = {
  en: { common: enCommon },
  "zh-CN": { common: zhCNCommon },
} as const

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "zh-CN"],
    interpolation: { escapeValue: false },
    ns: ["common"],
    defaultNS: "common",
    debug: false,
  })
}

export default i18n
