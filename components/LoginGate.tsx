"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthContext";

// Cổng đăng nhập cho phần "chơi chi tiết". Các trang card/nội dung vẫn xem tự do;
// khi bé mở một trò/bài/video mà chưa đăng nhập thì thay vì vào chơi sẽ hiện thẻ mời
// đăng nhập ngay tại chỗ (không rời trang). Dùng ở 2 kiểu:
//  - <PlayGate>: bọc children ở layout — trò chỉ mount khi đã đăng nhập (tránh trò tự
//    chạy/đọc tiếng/cộng sao "phía sau" cổng).
//  - <GateCard onClose>: nhét vào modal cho trang có sẵn nội dung (vd Tập gõ).

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.3-2.1 14-5.6l-6.5-5.5c-2 1.5-4.6 2.6-7.5 2.6-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5C41.9 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export function GateCard({
  onClose,
  backHref,
}: {
  onClose?: () => void;
  backHref?: string;
}) {
  const { signInWithGoogle } = useAuth();
  // Đăng nhập xong quay lại đúng trò/bài đang mở.
  const backToHere = () =>
    signInWithGoogle(
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : undefined,
    );
  return (
    <div className="login-card">
      <div className="login-emoji">🔒</div>
      <h1 className="login-title">Đăng nhập để chơi</h1>
      <p className="login-sub">
        Bé đăng nhập để mở trò chơi và lưu lại ngôi sao trên mọi thiết bị nhé!
      </p>
      <button className="google-btn" onClick={backToHere}>
        <GoogleIcon />
        <span>Đăng nhập bằng Google</span>
      </button>
      <p className="login-skip">
        {onClose ? (
          <button
            type="button"
            className="login-skip-link play-gate-skip"
            onClick={onClose}
          >
            Để lúc khác, quay lại xem
          </button>
        ) : (
          <a href={backHref ?? "/"} className="login-skip-link">
            Quay lại xem các mục
          </a>
        )}
      </p>
    </div>
  );
}

export default function PlayGate({
  openPaths = [],
  backHref,
  children,
}: {
  openPaths?: string[];
  backHref?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user, ready } = useAuth();

  // Trang card/nội dung công khai → cho xem thẳng.
  if (openPaths.includes(pathname)) return <>{children}</>;
  // Đã đăng nhập → vào chơi bình thường.
  if (ready && user) return <>{children}</>;

  // Chưa đăng nhập (hoặc đang kiểm tra session) → chưa mount trò, hiện cổng.
  return (
    <main className="wrap login-wrap">
      {ready ? (
        <GateCard backHref={backHref ?? openPaths[0] ?? "/"} />
      ) : (
        <div className="play-gate-loading" aria-hidden />
      )}
    </main>
  );
}
