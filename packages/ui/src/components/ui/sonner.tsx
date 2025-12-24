import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties, ReactElement } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps): ReactElement => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // 鍩虹鏍峰紡
          "--border-radius": "var(--radius)",
          // 鏅€?toast - 鍗婇€忔槑姣涚幓鐠?
          "--normal-bg": "var(--toast-normal)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // 鎴愬姛 toast
          "--success-bg": "var(--toast-success)",
          "--success-text": "var(--toast-success-foreground)",
          "--success-border": "var(--toast-success-border)",
          // 閿欒 toast
          "--error-bg": "var(--toast-error)",
          "--error-text": "var(--toast-error-foreground)",
          "--error-border": "var(--toast-error-border)",
          // 璀﹀憡 toast
          "--warning-bg": "var(--toast-warning)",
          "--warning-text": "var(--toast-warning-foreground)",
          "--warning-border": "var(--toast-warning-border)",
          // 淇℃伅 toast
          "--info-bg": "var(--toast-info)",
          "--info-text": "var(--toast-info-foreground)",
          "--info-border": "var(--toast-info-border)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
