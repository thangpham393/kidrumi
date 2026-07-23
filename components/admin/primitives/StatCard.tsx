import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import styles from "./StatCard.module.css";

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** thay đổi so với kỳ trước, ví dụ 12.4 hoặc -3.1 (đơn vị %) */
  delta?: number;
  deltaSuffix?: string;
  hint?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaSuffix = "%",
  hint,
}: StatCardProps) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className={styles.stat}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <span className={styles.iconWrap} aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className={`${styles.value} admin-num`}>{value}</div>
      {(delta !== undefined || hint) && (
        <div className={styles.foot}>
          {delta !== undefined && (
            <span className={styles.delta} data-up={up ? "true" : "false"}>
              {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(delta)}
              {deltaSuffix}
            </span>
          )}
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
      )}
    </div>
  );
}
