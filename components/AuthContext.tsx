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
  signInWithGoogle: () => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(toAuthUser(data.user));
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user ?? null));
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    const next = new URLSearchParams(window.location.search).get("next") || "/";
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
