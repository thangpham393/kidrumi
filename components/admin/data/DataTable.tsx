import { Inbox } from "lucide-react";
import { SkeletonRows } from "../primitives/Skeleton";
import styles from "./DataTable.module.css";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render: (row: T) => React.ReactNode;
};

export type Selection = {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allChecked: boolean;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyLabel?: string;
  emptyState?: React.ReactNode;
  selection?: Selection;
};

/**
 * Bảng tối giản, nhiều khoảng thở (spec §12).
 * Hỗ trợ loading (skeleton), chọn dòng (bulk), empty tuỳ biến.
 * ≤767px tự chuyển sang dạng thẻ xếp chồng.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyLabel = "Chưa có dữ liệu.",
  emptyState,
  selection,
}: DataTableProps<T>) {
  const colCount = columns.length + (selection ? 1 : 0);

  if (loading) {
    return <SkeletonRows rows={6} cols={colCount} />;
  }

  if (rows.length === 0) {
    if (emptyState) return <>{emptyState}</>;
    return (
      <div className={styles.empty}>
        <Inbox size={28} strokeWidth={1.75} />
        <p>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            {selection && (
              <th className={styles.checkCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selection.allChecked}
                  onChange={selection.onToggleAll}
                  aria-label="Chọn tất cả"
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                data-align={c.align ?? "left"}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row);
            const selected = selection?.selectedIds.has(id) ?? false;
            return (
              <tr key={id} data-selected={selected ? "true" : "false"}>
                {selection && (
                  <td className={styles.checkCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selected}
                      onChange={() => selection.onToggle(id)}
                      aria-label="Chọn dòng"
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} data-align={c.align ?? "left"} data-label={c.header}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
