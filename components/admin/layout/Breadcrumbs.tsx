"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NAV_FLAT } from "./nav";
import styles from "./Breadcrumbs.module.css";

export type Crumb = { label: string; href?: string };

function prettify(seg: string) {
  const s = decodeURIComponent(seg).replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function crumbsFromPath(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  for (const p of parts) {
    acc += "/" + p;
    if (acc === "/admin") {
      crumbs.push({ label: "Tổng quan", href: "/admin" });
      continue;
    }
    const item = NAV_FLAT.find((i) => i.href === acc);
    crumbs.push({ label: item?.label ?? prettify(p), href: acc });
  }
  return crumbs;
}

export default function Breadcrumbs({ items }: { items?: Crumb[] }) {
  const pathname = usePathname() ?? "/admin";
  const crumbs = items ?? crumbsFromPath(pathname);

  return (
    <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
      <ol className={styles.list}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={i} className={styles.item}>
              {c.href && !last ? (
                <Link href={c.href} className={styles.link}>
                  {c.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight size={14} className={styles.sep} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
