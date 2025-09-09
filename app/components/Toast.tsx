"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastItem = { id: string; message: string; type?: "info" | "success" | "error" };

type ToastContextType = {
  toasts: ToastItem[];
  show: (message: string, type?: ToastItem["type"]) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 2500);
  }, [remove]);

  const value = useMemo(() => ({ toasts, show, remove }), [toasts, show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-50 bottom-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg backdrop-blur border
            ${t.type === "success" ? "bg-green-500/90 text-white border-green-400/60" : t.type === "error" ? "bg-red-500/90 text-white border-red-400/60" : "bg-slate-800/90 text-white border-white/10"}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
