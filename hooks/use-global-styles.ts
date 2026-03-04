import { useEffect } from "react";

export function useGlobalStyles(css: string, id: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const existingStyle = document.getElementById(id);
    if (existingStyle) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [css, id]);
}
