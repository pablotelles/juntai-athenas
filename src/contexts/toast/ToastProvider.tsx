"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  isExiting: boolean;
}

interface ToastOptions {
  description?: string;
  /** Duração em ms antes do auto-dismiss. Default: 4000. */
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id" | "isExiting">, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4_000;
const EXIT_DURATION = 150;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismiss = React.useCallback(
    (id: string) => {
      // Mark as exiting to trigger exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
      );
      // Remove after exit animation completes
      setTimeout(() => removeToast(id), EXIT_DURATION);
    },
    [removeToast],
  );

  const addToast = React.useCallback(
    (toast: Omit<ToastItem, "id" | "isExiting">, duration = DEFAULT_DURATION) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id, isExiting: false }]);

      // Schedule auto-dismiss
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Internal hook (used by Toaster) ─────────────────────────────────────────

export function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

// ─── Public hook ─────────────────────────────────────────────────────────────

export function useToast() {
  const { addToast } = useToastContext();

  const toast = React.useMemo(() => {
    const show =
      (variant: ToastVariant) =>
      (title: string, options?: ToastOptions) =>
        addToast({ variant, title, description: options?.description }, options?.duration);

    return {
      success: show("success"),
      error: show("error"),
      info: show("info"),
      warning: show("warning"),
    };
  }, [addToast]);

  return { toast };
}
