"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChild } from "./ChildContext";
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

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo" aria-label="Kidrumi — trang chủ">
          <Logo />
        </Link>
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-home ${pathname === "/" ? "active" : ""}`}
            title="Trang chủ"
          >
            🏠
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span className="avatar">🧒</span>
          <span>{child?.name ?? "Bé Yêu"}</span>
          <button className="logout" onClick={reset}>
            Thoát
          </button>
        </div>
      </div>
    </nav>
  );
}
