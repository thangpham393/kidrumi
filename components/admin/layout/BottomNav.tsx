"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clapperboard, Component, Menu } from "lucide-react";
import styles from "./BottomNav.module.css";

const items = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/shadowing", label: "Shadowing", icon: Clapperboard },
  { href: "/admin/ui", label: "Giao diện", icon: Component },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname() ?? "/admin";
  return (
    <nav className={styles.bottomNav} aria-label="Điều hướng nhanh">
      {items.map((it) => {
        const Icon = it.icon;
        const active = isActive(pathname, it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={styles.item}
            data-active={active ? "true" : "false"}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.75} />
            <span>{it.label}</span>
          </Link>
        );
      })}
      <button type="button" className={styles.item} onClick={onOpenMenu} aria-label="Mở menu đầy đủ">
        <Menu size={22} strokeWidth={1.75} />
        <span>Thêm</span>
      </button>
    </nav>
  );
}
