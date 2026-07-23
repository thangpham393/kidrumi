import styles from "./Badge.module.css";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export type BadgeProps = {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ tone = "neutral", dot = false, children, className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${className ?? ""}`} data-tone={tone}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
