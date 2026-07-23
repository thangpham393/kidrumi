import styles from "./Skeleton.module.css";

export type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  radius?: string;
  circle?: boolean;
  className?: string;
};

/** Khối giữ chỗ khi tải. Không bao giờ dùng spinner một mình (spec). */
export default function Skeleton({ width, height, radius, circle, className }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ""}`}
      style={{
        width,
        height,
        borderRadius: circle ? "9999px" : radius,
      }}
      aria-hidden="true"
    />
  );
}

/** Bộ khung hàng bảng — dùng cho DataTable loading. */
export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className={styles.table} aria-label="Đang tải" role="status">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.row}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={14} width={c === 0 ? "60%" : "40%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Bộ khung thẻ số liệu. */
export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton height={12} width="45%" />
      <Skeleton height={30} width="65%" />
      <Skeleton height={12} width="35%" />
    </div>
  );
}
