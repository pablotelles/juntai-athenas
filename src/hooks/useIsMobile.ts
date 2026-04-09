import * as React from "react";

/** Matches Tailwind's `lg` breakpoint — 1024px */
const LG_BREAKPOINT = 1024;

/**
 * Returns `true` when the viewport is narrower than the `lg` breakpoint.
 * SSR-safe: defaults to `false` (desktop-first) on the server.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    setIsMobile(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/** Matches Tailwind's `md` breakpoint — 768px */
const MD_BREAKPOINT = 768;

/**
 * Returns `"mobile"` | `"tablet"` | `"desktop"` based on the current viewport.
 * SSR-safe: defaults to `"desktop"` on the server.
 */
export function useBreakpoint(): "mobile" | "tablet" | "desktop" {
  const [bp, setBp] = React.useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  React.useEffect(() => {
    function calculate() {
      const w = window.innerWidth;
      if (w < MD_BREAKPOINT) return "mobile" as const;
      if (w < LG_BREAKPOINT) return "tablet" as const;
      return "desktop" as const;
    }

    setBp(calculate());
    const handler = () => setBp(calculate());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return bp;
}
