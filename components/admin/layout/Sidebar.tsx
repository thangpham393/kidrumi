"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NAV, type NavGroup } from "./nav";
import MascotCard from "./MascotCard";
import styles from "./Sidebar.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function groupHasActive(pathname: string, group: NavGroup) {
  return group.items.some((i) => isActive(pathname, i.href));
}

const reduce = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };

export default function Sidebar({
  collapsed,
  drawerOpen,
  onToggleCollapsed,
  onCloseDrawer,
}: {
  collapsed: boolean;
  drawerOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseDrawer: () => void;
}) {
  const pathname = usePathname() ?? "/admin";

  // Trạng thái mở/đóng mỗi nhóm có tiêu đề.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of NAV) if (g.title) init[g.title] = g.defaultOpen ?? true;
    return init;
  });

  const toggleGroup = (title: string) =>
    setOpen((o) => ({ ...o, [title]: !o[title] }));

  return (
    <aside
      className={styles.sidebar}
      data-collapsed={collapsed ? "true" : "false"}
      data-open={drawerOpen ? "true" : "false"}
      aria-label="Điều hướng quản trị"
    >
      {/* Brand */}
      <div className={styles.brand}>
        <Link href="/admin" className={styles.brandLink} aria-label="Kidrumi Admin">
          <span className={styles.mark} aria-hidden="true">
            K
          </span>
          <span className={styles.wordmark}>
            Kidrumi <span className={styles.tag}>Admin</span>
          </span>
        </Link>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCloseDrawer}
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map((group, gi) => {
          const items = group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.item}
                data-active={active ? "true" : "false"}
                aria-current={active ? "page" : undefined}
                onClick={onCloseDrawer}
                title={collapsed ? item.label : undefined}
              >
                <span className={styles.indicator} aria-hidden="true" />
                <Icon size={20} strokeWidth={1.75} className={styles.itemIcon} />
                <span className={styles.itemLabel}>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </Link>
            );
          });

          // Nhóm không tiêu đề: render thẳng.
          if (!group.title) {
            return (
              <div key={gi} className={styles.group}>
                {items}
              </div>
            );
          }

          const isOpen = collapsed ? true : open[group.title];
          const hasActive = groupHasActive(pathname, group);

          return (
            <div key={gi} className={styles.group}>
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.title!)}
                aria-expanded={isOpen}
                data-active={hasActive ? "true" : "false"}
              >
                <span className={styles.groupTitle}>{group.title}</span>
                <ChevronDown
                  size={14}
                  className={styles.chevron}
                  data-open={isOpen ? "true" : "false"}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className={styles.groupItems}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduce}
                    style={{ overflow: "hidden" }}
                  >
                    {items}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Mascot */}
      <div className={styles.footer}>
        <MascotCard collapsed={collapsed} />
      </div>
    </aside>
  );
}
