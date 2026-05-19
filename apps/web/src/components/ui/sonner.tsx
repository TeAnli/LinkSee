import { Icon } from "@iconify/react"
import { Toaster as Sonner } from "sonner"
import { useThemeStore } from "@/stores/useThemeStore"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const mode = useThemeStore((s) => s.mode)

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      icons={{
        success: <Icon icon="mdi:check-circle-outline" className="size-4" />,
        info: <Icon icon="mdi:information-outline" className="size-4" />,
        warning: <Icon icon="mdi:alert-outline" className="size-4" />,
        error: <Icon icon="mdi:close-octagon-outline" className="size-4" />,
        loading: <Icon icon="mdi:loading" className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-flat-lg group-[.toaster]:border-[1.5px] group-[.toaster]:rounded-[var(--radius-md)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
