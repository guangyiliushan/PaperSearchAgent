import { Sun, Moon } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"

import { Button } from "@workspace/ui/components/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={t("toggleTheme")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  )
}
