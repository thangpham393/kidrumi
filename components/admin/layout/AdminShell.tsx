"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import ToastProvider from "../feedback/ToastProvider";
import CommandPaletteProvider from "../command/CommandPaletteProvider";
import styles from "./AdminShell.module.css";

const COLLAPSE_KEY = "kidrumi-admin-sidebar-collapsed";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false); // rail trên desktop
  const [drawerOpen, setDrawerOpen] = useState(false); // off-canvas trên tablet/mobile

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <div className={styles.shell} data-collapsed={collapsed ? "true" : "false"}>
          <Sidebar
            collapsed={collapsed}
            drawerOpen={drawerOpen}
            onToggleCollapsed={toggleCollapsed}
            onCloseDrawer={() => setDrawerOpen(false)}
          />

          {drawerOpen && (
            <button
              type="button"
              className={styles.overlay}
              aria-label="Đóng menu"
              onClick={() => setDrawerOpen(false)}
            />
          )}

          <div className={styles.main}>
            <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
            <main className={styles.content}>
              <div className={styles.container}>{children}</div>
            </main>
          </div>

          <BottomNav onOpenMenu={() => setDrawerOpen(true)} />
        </div>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
