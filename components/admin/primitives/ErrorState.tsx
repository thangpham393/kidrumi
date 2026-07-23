"use client";

import { RotateCw } from "lucide-react";
import Button from "./Button";
import styles from "./ErrorState.module.css";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorState({
  title = "Ối, có gì đó chưa ổn",
  description = "Không tải được dữ liệu. Bạn thử lại một chút nhé.",
  onRetry,
  retryLabel = "Thử lại",
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.art} aria-hidden="true">
        <span className={styles.emoji}>🙈</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      {onRetry && (
        <Button variant="secondary" leadingIcon={RotateCw} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
