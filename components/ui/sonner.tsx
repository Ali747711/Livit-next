import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  InformationCircleIcon,
  CancelCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      visibleToasts={5}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={20}
            color="#10b981"
            strokeWidth={2}
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={20}
            color="#3b82f6"
            strokeWidth={2}
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={20}
            color="#f59e0b"
            strokeWidth={2}
          />
        ),
        error: (
          <HugeiconsIcon
            icon={CancelCircleIcon}
            size={20}
            color="#ef4444"
            strokeWidth={2}
          />
        ),
        loading: (
          <div className="animate-spin">
            <HugeiconsIcon
              icon={Loading03Icon}
              size={20}
              color="#3b82f6"
              strokeWidth={2}
            />
          </div>
        ),
      }}
      toastOptions={{
        unstyled: false,

        classNames: {
          toast: `
            group toast
            gap-3 rounded-xl
            border border-slate-200/50
            bg-white/95 backdrop-blur-sm
            shadow-lg shadow-slate-900/5
            px-4 py-3
            font-sans text-sm font-medium
            transition-all
            data-[dismissed=true]:slide-out-to-right-full
          `,

          title: "text-slate-900 font-semibold text-sm",
          description: "text-slate-600 text-xs mt-1 leading-relaxed",

          actionButton: `
            min-w-[80px]
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white
            px-3.5 py-1.5
            rounded-lg text-xs font-medium
            transition-all shadow-sm
            data-[destructive=true]:bg-red-600
            data-[destructive=true]:hover:bg-red-700
            data-[destructive=true]:active:bg-red-800
          `,

          cancelButton: `
            min-w-[80px]
            bg-slate-100 hover:bg-slate-200 active:bg-slate-300
            text-slate-700
            border border-slate-200
            px-3.5 py-1.5
            rounded-lg text-xs font-medium
            transition-all
          `,

          closeButton: `
            bg-white border border-slate-200
            hover:bg-slate-50 hover:text-slate-900
            text-slate-600
            rounded-full p-1 transition-colors
          `,

          // Variant accent borders
          success: "border-l-4 !border-l-emerald-500   bg-emerald-50/30",
          error: "border-l-4 !border-l-red-500      bg-red-50/30",
          warning: "border-l-4 !border-l-amber-500    bg-amber-50/30",
          info: "border-l-4 !border-l-blue-500     bg-blue-50/30",
          loading: "border-l-4 !border-l-blue-500     bg-blue-50/30",
        },

        style: {
          minWidth: "320px",
          maxWidth: "420px",
        },
      }}
      {...props}
    />
  );
}
