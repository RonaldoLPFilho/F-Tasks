import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
};

const ToastCtx = createContext<{
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      const toast: Toast = { id, duration: 4000, ...t };
      setToasts((prev: any) => [...prev, toast]);
      // autoclose
      const timer = setTimeout(() => dismiss(id), toast.duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ toasts, show, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <div className="fixed inset-x-0 bottom-3 z-[60] flex flex-col items-center gap-2 px-2 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className={
              "pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-2xl border p-8 pr-2 shadow-lg ring-1 " +
              (t.type === "success"
                ? "border-green-200 bg-green-50 ring-green-100"
                : t.type === "error"
                ? "border-red-200 bg-red-50 ring-red-100"
                : "border-blue-200 bg-blue-50 ring-blue-100")
            }
            role="status"
            aria-live="polite"
          >
            <div className="pt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-8 w-8" />}
              {t.type === "error" && <XCircle className="h-5 w-5" />}
              {t.type === "info" && <Info className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1 text-sm text-gray-900">
              {t.message}
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => onDismiss(t.id)}
              className="rounded-xl p-1 text-gray-500 hover:bg-black/5 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
