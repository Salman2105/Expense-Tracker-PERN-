import { useState, type PropsWithChildren } from "react";
import { ToastContext, type ToastTone } from "./toast-context";

type Toast = { id: number; message: string; tone: ToastTone };

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, tone: ToastTone = "info") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000);
  };
  return <ToastContext.Provider value={{ showToast }}>{children}<div className="fixed right-4 top-4 z-[100] space-y-2" aria-live="polite">{toasts.map((toast) => <div key={toast.id} role="status" className={toast.tone === "error" ? "max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--expense)] shadow-lg" : toast.tone === "success" ? "max-w-sm rounded-md border border-[var(--primary)] bg-[var(--primary-light)] px-4 py-3 text-sm text-[var(--primary)] shadow-lg" : "max-w-sm rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-lg"}>{toast.message}</div>)}</div></ToastContext.Provider>;
}

