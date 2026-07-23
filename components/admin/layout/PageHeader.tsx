import Breadcrumbs, { type Crumb } from "./Breadcrumbs";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /**
   * Breadcrumb inline trong page header. Mặc định tắt vì Topbar đã hiển thị
   * breadcrumb toàn cục — bật cho các trang chi tiết muốn nhấn mạnh đường dẫn.
   */
  breadcrumbs?: Crumb[] | boolean;
};

export default function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
  const showCrumbs = breadcrumbs === true || Array.isArray(breadcrumbs);
  return (
    <header className={styles.header}>
      {showCrumbs && (
        <div className={styles.crumbs}>
          <Breadcrumbs items={Array.isArray(breadcrumbs) ? breadcrumbs : undefined} />
        </div>
      )}
      <div className={styles.row}>
        <div className={styles.titles}>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.desc}>{description}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
