"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChild } from "./ChildContext";
import { useAuth } from "./AuthContext";
import Logo from "./Logo";

const links = [
  { href: "/tasks", label: "Nhiệm vụ" },
  { href: "/english", label: "Tiếng Anh" },
  { href: "/chinese", label: "Tiếng Trung" },
  { href: "/vietnamese", label: "Tiếng Việt" },
  { href: "/math", label: "Học Toán" },
  { href: "/typing", label: "Tập gõ phím" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { child, reset } = useChild();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  // Đóng menu tài khoản khi bấm ra ngoài (bấm mục nav cũng tính là ra ngoài).
  useEffect(() => {
    if (!acctOpen) return;
    const onDown = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) {
        setAcctOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [acctOpen]);

  // Khu quản trị (/admin) có shell riêng — ẩn hoàn toàn nav của trang trẻ em.
  if (pathname?.startsWith("/admin")) return null;

  // Tên hiển thị: ưu tiên tài khoản Google, sau đó tới hồ sơ bé, cuối cùng mặc định.
  const displayName = user?.name ?? child?.name ?? "Bé Yêu";

  const handleLogout = async () => {
    if (user) await signOut();
    reset();
    close();
    setAcctOpen(false);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="KATKID — trang chủ" onClick={close}>
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
        </div>

        <div className="nav-user">
          {user ? (
            <div className={`nav-acct ${acctOpen ? "open" : ""}`} ref={acctRef}>
              <button
                className="acct-btn"
                aria-haspopup="menu"
                aria-expanded={acctOpen}
                onClick={() => setAcctOpen((o) => !o)}
              >
                <span className="avatar">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="" className="avatar-img" />
                  ) : (
                    "🐰"
                  )}
                </span>
                <span className="nav-user-name">{displayName}</span>
                <span className="acct-caret" aria-hidden>
                  ▾
                </span>
              </button>

              {acctOpen && (
                <div className="acct-menu" role="menu">
                  <div className="acct-head">
                    <div className="nm">{displayName}</div>
                    {user.email && <div className="em">{user.email}</div>}
                  </div>
                  <div className="acct-sep" />
                  <Link
                    href="/parents"
                    className="acct-item"
                    role="menuitem"
                    onClick={() => setAcctOpen(false)}
                  >
                    📊 <span>Góc cha mẹ</span>
                  </Link>
                  <div className="acct-sep" />
                  <button
                    className="acct-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    🚪 <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="nav-login">
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
