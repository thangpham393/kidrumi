"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

export type PaginationProps = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={styles.pagination}>
      <span className={styles.range}>
        <b className="admin-num">{from}–{to}</b> trong <b className="admin-num">{total}</b>
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
        <span className={styles.pageNum}>
          Trang <b className="admin-num">{page}</b> / <span className="admin-num">{pages}</span>
        </span>
        <button
          type="button"
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
