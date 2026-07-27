"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChild } from "@/components/ChildContext";
import Ambient from "@/components/Ambient";
import { getTheme, themeAsset, themeBgGradient } from "@/app/tasks/worldThemes";

/* ---------------------------------------------------------------------------
   Nền theo "thế giới" của bé, dùng chung cho các trang nội dung.
   • Bỏ qua trang chủ ("/") — giữ nền clay mặc định.
   • Bỏ qua /tasks — trang đó tự lo nền riêng (đậm) + bạn đồng hành.
   • Bỏ qua /login, /auth, /admin — không cần nền theo bé.
   Bản ở đây là "dịu": phủ trắng nhẹ để chữ tối vẫn đọc rõ trên mọi thế giới.
--------------------------------------------------------------------------- */

export default function ThemeScene() {
  const pathname = usePathname();
  const { child } = useChild();

  const skip =
    pathname === "/" ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin");

  const theme = getTheme(child?.world);

  // Đổi màu tiêu đề trang theo nền: chữ headerInk + bóng khi nền tối.
  useEffect(() => {
    const root = document.documentElement;
    const clear = () => {
      root.style.removeProperty("--page-ink");
      root.style.removeProperty("--page-ink-shadow");
      root.style.removeProperty("--page-ink-dim");
    };
    if (skip) {
      clear();
      return;
    }
    const dark = theme.headerInk.toLowerCase() === "#ffffff";
    root.style.setProperty("--page-ink", theme.headerInk);
    root.style.setProperty(
      "--page-ink-shadow",
      dark ? "0 1px 2px rgba(20,16,54,.9), 0 2px 14px rgba(20,16,54,.7)" : "none",
    );
    root.style.setProperty("--page-ink-dim", "0.85");
    return clear;
  }, [skip, theme.headerInk]);

  if (skip) return null;
  return (
    <>
      <div
        className="theme-scene root"
        aria-hidden="true"
        style={{ backgroundImage: `url(${themeAsset(theme.key, "bg")}), ${themeBgGradient(theme)}` }}
      />
      <Ambient kind={theme.ambient} color={theme.secondary} />
    </>
  );
}
