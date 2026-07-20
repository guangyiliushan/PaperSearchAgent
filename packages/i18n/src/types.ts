import type { resources } from "./instance"

export type I18nResources = typeof resources
export type Locale = keyof I18nResources
export type Namespace = keyof I18nResources[Locale]

declare module "react-i18next" {
  interface CustomTypeOptions {
    resources: I18nResources
    defaultNS: "common"
  }
}
