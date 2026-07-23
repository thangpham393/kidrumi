"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import Kbd from "../primitives/Kbd";
import { filterCommands, GROUP_LABEL, type Command } from "./commands";
import type { SlimVideo } from "@/lib/admin/library";
import styles from "./CommandPalette.module.css";

function runThemeToggle() {
  const el = document.querySelector<HTMLElement>(".admin-root");
  const current = el?.getAttribute("data-admin-theme");
  const isDark =
    current === "dark" ||
    (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  el?.setAttribute("data-admin-theme", next);
  localStorage.setItem("kidrumi-admin-theme", next);
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [videos, setVideos] = useState<SlimVideo[]>([]);
  const fetched = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => filterCommands(query, videos), [query, videos]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      // Nạp danh sách video thật một lần để tìm kiếm.
      if (!fetched.current) {
        fetched.current = true;
        fetch("/api/admin/library")
          .then((r) => r.json())
          .then((d) => setVideos(d.videos ?? []))
          .catch(() => {});
      }
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Cuộn mục đang chọn vào tầm nhìn.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = (cmd: Command) => {
    onClose();
    if (cmd.action === "theme") {
      runThemeToggle();
      return;
    }
    if (cmd.external && cmd.href) {
      window.open(cmd.href, "_blank");
      return;
    }
    if (cmd.href) router.push(cmd.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) select(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Chèn tiêu đề nhóm khi đổi loại.
  let lastKind: string | null = null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.palette}
            role="dialog"
            aria-modal="true"
            aria-label="Bảng lệnh"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className={styles.searchRow}>
              <Search size={20} className={styles.searchIcon} aria-hidden="true" />
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Tìm trang, học sinh, khoá học, video…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Tìm kiếm lệnh"
              />
              <Kbd>Esc</Kbd>
            </div>

            <div className={styles.list} ref={listRef} role="listbox">
              {results.length === 0 && (
                <div className={styles.empty}>
                  Không tìm thấy kết quả cho “{query}”.
                </div>
              )}
              {results.map((cmd, i) => {
                const showHeader = cmd.kind !== lastKind;
                lastKind = cmd.kind;
                const Icon = cmd.icon;
                return (
                  <div key={cmd.id}>
                    {showHeader && <div className={styles.groupLabel}>{GROUP_LABEL[cmd.kind]}</div>}
                    <button
                      type="button"
                      data-idx={i}
                      className={styles.item}
                      data-active={i === active ? "true" : "false"}
                      role="option"
                      aria-selected={i === active}
                      onMouseMove={() => setActive(i)}
                      onClick={() => select(cmd)}
                    >
                      <span className={styles.itemIcon}>
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className={styles.itemLabel}>{cmd.label}</span>
                      {cmd.hint && <span className={styles.itemHint}>{cmd.hint}</span>}
                      {i === active && (
                        <CornerDownLeft size={15} className={styles.enter} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <span><Kbd>↑</Kbd><Kbd>↓</Kbd> di chuyển</span>
              <span><Kbd>↵</Kbd> chọn</span>
              <span className={styles.footerBrand}>Kidrumi Admin</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
