"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import styles from "./DropdownMenu.module.css";

export type DropdownMenuProps = {
  trigger: React.ReactNode;
  align?: "start" | "end";
  children: React.ReactNode;
  menuLabel?: string;
  menuClassName?: string;
};

export function DropdownMenu({
  trigger,
  align = "end",
  children,
  menuLabel,
  menuClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef} onClick={() => setOpen(false)}>
      <div
        className={styles.triggerWrap}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`${styles.menu} ${menuClassName ?? ""}`}
            data-align={align}
            role="menu"
            aria-label={menuLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  children,
  onSelect,
  tone = "default",
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button type="button" className={styles.item} data-tone={tone} role="menuitem" onClick={onSelect}>
      {Icon && <Icon size={16} strokeWidth={2} className={styles.itemIcon} />}
      <span>{children}</span>
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

export function DropdownSeparator() {
  return <div className={styles.sep} role="separator" />;
}
