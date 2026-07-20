import { useTranslation } from "react-i18next"
import { Button } from "@workspace/ui/components/button"
import { ModeToggle } from "@/components/mode-toggle"

export function App() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh flex-col p-6">
      <div className="flex justify-end">
        <ModeToggle />
      </div>
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("projectReady")}</h1>
          <p>{t("addComponents")}</p>
          <p>{t("buttonAdded")}</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="text-muted-foreground font-mono text-xs">
          ({t("pressKey", { key: "d" })})
        </div>
      </div>
    </div>
  )
}
