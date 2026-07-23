"use client";

import { Menu, Plus, Search, UserCircle, LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useCommandPalette } from "../command/CommandPaletteProvider";
import {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "../primitives/DropdownMenu";
import Kbd from "../primitives/Kbd";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "./ThemeToggle";
import styles from "./Topbar.module.css";

function initials(name?: string | null) {
  if (!name) return "KD";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() || "KD";
}

export default function Topbar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { setOpen } = useCommandPalette();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const doSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button type="button" className={`${styles.iconBtn} ${styles.hamburger}`} onClick={onOpenDrawer} aria-label="Mở menu">
          <Menu size={22} />
        </button>
        <Breadcrumbs />
      </div>

      <button type="button" className={styles.search} onClick={() => setOpen(true)} aria-label="Mở tìm kiếm (⌘K)">
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <span className={styles.searchText}>Tìm video, trang…</span>
        <span className={styles.searchKbd}>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className={styles.right}>
        <button
          type="button"
          className={`${styles.iconBtn} ${styles.searchMobile}`}
          onClick={() => setOpen(true)}
          aria-label="Tìm kiếm"
        >
          <Search size={20} />
        </button>

        <ThemeToggle />

        {/* Quick add — hành động THẬT duy nhất: nhập video Shadowing */}
        <Link href="/admin/shadowing" className={`${styles.iconBtn} ${styles.quickAdd}`} aria-label="Nhập video Shadowing" title="Nhập video Shadowing">
          <Plus size={20} />
        </Link>

        {/* Profile — tài khoản Supabase thật */}
        <DropdownMenu
          menuLabel="Tài khoản"
          trigger={
            <button type="button" className={styles.avatarBtn} aria-label="Tài khoản">
              <span className={styles.avatar}>{initials(user?.name)}</span>
            </button>
          }
        >
          <div className={styles.profileHead}>
            <span className={styles.profileAvatar}>{initials(user?.name)}</span>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{user?.name ?? "Chưa đăng nhập"}</div>
              <div className={styles.profileEmail}>{user?.email ?? "Đăng nhập để đồng bộ"}</div>
            </div>
          </div>
          <DropdownSeparator />
          {user ? (
            <>
              <DropdownItem icon={UserCircle} onSelect={() => router.push("/")}>Về trang chính</DropdownItem>
              <DropdownItem icon={LogOut} tone="danger" onSelect={doSignOut}>Đăng xuất</DropdownItem>
            </>
          ) : (
            <DropdownItem icon={LogIn} onSelect={() => router.push("/login")}>Đăng nhập</DropdownItem>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
}
