"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string; // tên hiển thị lấy từ Google
  avatar: string | null; // ảnh đại diện Google (nếu có)
};

type Ctx = {
  user: AuthUser | null;
  ready: boolean; // đã kiểm tra session xong chưa
  // next: nơi quay lại sau khi đăng nhập. Bỏ trống thì lấy ?next trên URL, rồi mới về "/".
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

function toAuthUser(u: User | null): AuthUser | null {
  if (!u) return null;
  const meta = u.user_metadata ?? {};
  const name =
    meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : "Bé Yêu");
  return {
    id: u.id,
    email: u.email ?? null,
    name,
    avatar: meta.avatar_url || meta.picture || null,
  };
}

// Cùng một người dùng? (dùng để giữ nguyên tham chiếu object, tránh nạp lại
// vô cớ khi Supabase làm mới token lúc quay lại tab).
function sameAuthUser(a: AuthUser | null, b: AuthUser | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.email === b.email && a.name === b.name && a.avatar === b.avatar;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const next = toAuthUser(data.user);
      setUser((prev) => (sameAuthUser(prev, next) ? prev : next));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = toAuthUser(session?.user ?? null);
      // Giữ nguyên tham chiếu nếu vẫn là người dùng đó → không kích hoạt
      // nạp lại danh sách bé (mất theme vừa chọn) khi token làm mới.
      setUser((prev) => (sameAuthUser(prev, next) ? prev : next));
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async (nextArg?: string) => {
    const next =
      nextArg ||
      new URLSearchParams(window.location.search).get("next") ||
      "/";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next,
        )}`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, ready, signInWithGoogle, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
