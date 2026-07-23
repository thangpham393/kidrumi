import styles from "./Card.module.css";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padding?: "md" | "lg" | "none";
};

export function Card({
  interactive = false,
  padding = "lg",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${className ?? ""}`}
      data-interactive={interactive ? "true" : "false"}
      data-padding={padding}
      {...rest}
    >
      {children}
    </div>
  );
}

export type PanelProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** Card có tiêu đề + đường kẻ mảnh — khung chứa bảng/biểu đồ/form. */
export function Panel({ title, subtitle, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={`${styles.panel} ${className ?? ""}`}>
      {(title || action) && (
        <header className={styles.panelHead}>
          <div className={styles.panelTitles}>
            {title && <h3 className={styles.panelTitle}>{title}</h3>}
            {subtitle && <p className={styles.panelSub}>{subtitle}</p>}
          </div>
          {action && <div className={styles.panelAction}>{action}</div>}
        </header>
      )}
      <div className={`${styles.panelBody} ${bodyClassName ?? ""}`}>{children}</div>
    </section>
  );
}

export default Card;
