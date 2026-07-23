import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";

export type EmptyStateProps = {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tone?: "brand" | "neutral";
};

export default function EmptyState({
  icon: Icon = Inbox,
  emoji,
  title,
  description,
  action,
  secondaryAction,
  tone = "brand",
}: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.art} data-tone={tone} aria-hidden="true">
        {emoji ? <span className={styles.emoji}>{emoji}</span> : <Icon size={30} strokeWidth={1.75} />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
