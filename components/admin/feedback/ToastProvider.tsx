"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import styles from "./ToastProvider.module.css";

type Tone = "default" | "success" | "danger" | "info";
type Toast = { id: number; tone: Tone; title: string; description?: string };
type ToastInput = { tone?: Tone; title: string; description?: string; duration?: number };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải nằm trong ToastProvider");
  return ctx;
}

const icons = {
  default: Info,
  success: CheckCircle2,
  danger: TriangleAlert,
  info: Info,
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ tone = "default", title, description, duration = 4000 }: ToastInput) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, tone, title, description }]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={styles.viewport} role="region" aria-label="Thông báo" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.tone];
            return (
              <motion.div
                key={t.id}
                className={styles.toast}
                data-tone={t.tone}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                layout
              >
                <span className={styles.icon}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className={styles.body}>
                  <p className={styles.title}>{t.title}</p>
                  {t.description && <p className={styles.desc}>{t.description}</p>}
                </div>
                <button
                  type="button"
                  className={styles.close}
                  onClick={() => remove(t.id)}
                  aria-label="Đóng thông báo"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
