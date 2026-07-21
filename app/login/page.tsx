"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const GoogleIcon = () => (
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const { user, ready, signInWithGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const hasError = params.get("error");

  // Đã đăng nhập rồi thì rời khỏi trang login.
  useEffect(() => {
    if (ready && user) {
      const next = params.get("next") || "/";
      router.replace(next);
    }
  }, [ready, user, router, params]);

  return (
    <main className="wrap login-wrap">
      <div className="login-card">
        <div className="login-emoji">🧸</div>
        <h1 className="login-title">Đăng nhập Kidrumi</h1>
        <p className="login-sub">
          Đăng nhập để lưu lại tiến trình học và ngôi sao của con trên mọi thiết
          bị.
        </p>

        {hasError && (
          <p className="login-error">
            Đăng nhập chưa thành công, con thử lại nhé!
          </p>
        )}

        <button className="google-btn" onClick={signInWithGoogle}>
          <GoogleIcon />
          <span>Đăng nhập bằng Google</span>
        </button>

        <p className="login-skip">
          Hoặc{" "}
          <a href="/" className="login-skip-link">
            vào chơi luôn không cần đăng nhập
          </a>
        </p>
      </div>
    </main>
  );
}
