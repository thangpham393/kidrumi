"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useChild } from "./ChildContext";
import { useAuth } from "./AuthContext";
import Logo from "./Logo";

const links = [
  { href: "/tasks", label: "Nhiệm vụ" },
  { href: "/shadowing", label: "Shadowing" },
  { href: "/math", label: "Học toán" },
  { href: "/typing", label: "Tập gõ phím" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { child, reset } = useChild();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Tên hiển thị: ưu tiên tài khoản Google, sau đó tới hồ sơ bé, cuối cùng mặc định.
  const displayName = user?.name ?? child?.name ?? "Bé Yêu";

  const handleLogout = async () => {
    if (user) await signOut();
    reset();
    close();
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="Kidrumi — trang chủ" onClick={close}>
          <Logo />
        </Link>

        <div className={`nav-links ${open ? "open" : ""}`}>
          <Link
            href="/"
            className={`nav-home ${pathname === "/" ? "active" : ""}`}
            title="Trang chủ"
            onClick={close}
          >
            🏠 <span className="nav-home-label">Trang chủ</span>
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? "active" : ""}
              onClick={close}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button className="logout menu-only" onClick={handleLogout}>
              Đăng xuất
            </button>
          ) : (
            <Link href="/login" className="nav-login menu-only" onClick={close}>
              Đăng nhập
            </Link>
          )}
        </div>

        <div className="nav-user">
          <span className="avatar">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="avatar-img" />
            ) : (
              "🧒"
            )}
          </span>
          <span className="nav-user-name">{displayName}</span>
          {user ? (
            <button className="logout inline-only" onClick={handleLogout}>
              Đăng xuất
            </button>
          ) : (
            <Link href="/login" className="nav-login inline-only">
              Đăng nhập
            </Link>
          )}
        </div>

        <button
          className={`nav-burger ${open ? "open" : ""}`}
          aria-label="Mở menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
