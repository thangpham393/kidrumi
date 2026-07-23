"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import styles from "./TableToolbar.module.css";

export type TableToolbarProps = {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** nút Filter / Sort / Export … (bên phải) */
  children?: React.ReactNode;
  /** số dòng đang chọn — >0 thì hiện thanh bulk */
  selectedCount?: number;
  onClearSelection?: () => void;
  bulkActions?: React.ReactNode;
};

export default function TableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm…",
  children,
  selectedCount = 0,
  onClearSelection,
  bulkActions,
}: TableToolbarProps) {
  const showBulk = selectedCount > 0;

  return (
    <div className={styles.toolbar}>
      <AnimatePresence mode="wait" initial={false}>
        {showBulk ? (
          <motion.div
            key="bulk"
            className={styles.bulk}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button type="button" className={styles.clear} onClick={onClearSelection} aria-label="Bỏ chọn">
              <X size={16} />
            </button>
            <span className={styles.count}>Đã chọn {selectedCount}</span>
            <div className={styles.bulkActions}>{bulkActions}</div>
          </motion.div>
        ) : (
          <motion.div
            key="normal"
            className={styles.normal}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.search}>
              <Search size={16} className={styles.searchIcon} aria-hidden="true" />
              <input
                className={styles.searchInput}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Tìm trong bảng"
              />
            </div>
            <div className={styles.actions}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
