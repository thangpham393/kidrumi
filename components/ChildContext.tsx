"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthContext";

export type Child = {
  id: string; // uuid trong CSDL, hoặc "local" khi chưa đăng nhập
  name: string;
  world: string; // key of a world theme
  stars: number;
};

type Ctx = {
  child: Child | null; // bé đang được chọn
  children: Child[];
  ready: boolean;
  createChild: (name: string, world: string) => Promise<Child | null>;
  setActive: (id: string) => void;
  deleteChild: (id: string) => Promise<void>;
  addStars: (n: number) => void;
  reset: () => void;
};

const ChildCtx = createContext<Ctx | null>(null);
const KEY = "kidrumi_child"; // fallback localStorage khi chưa đăng nhập
const ACTIVE_KEY = "kidrumi_active_child";

export function ChildProvider({ children: kids }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [list, setList] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // Tránh persist đè khi vừa nạp xong ở chế độ khách.
  const loadedGuest = useRef(false);

  // ---- Nạp danh sách bé mỗi khi trạng thái đăng nhập đổi ----
  useEffect(() => {
    if (!authReady) return;
    let active = true;

    (async () => {
      setReady(false);
      if (user) {
        // Đã đăng nhập: lấy hồ sơ từ Supabase.
        const { data } = await supabase
          .from("children")
          .select("id, name, world, stars")
          .order("created_at", { ascending: true });
        if (!active) return;
        const rows = (data ?? []) as Child[];
        setList(rows);
        const stored =
          typeof localStorage !== "undefined"
            ? localStorage.getItem(ACTIVE_KEY)
            : null;
        setActiveId(
          rows.find((c) => c.id === stored)?.id ?? rows[0]?.id ?? null
        );
      } else {
        // Khách: dùng localStorage (một bé) để math/typing vẫn chạy.
        loadedGuest.current = true;
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) {
            const c = JSON.parse(raw) as Partial<Child>;
            const one: Child = {
              id: "local",
              name: c.name ?? "Bé Yêu",
              world: c.world ?? "carrot",
              stars: c.stars ?? 0,
            };
            setList([one]);
            setActiveId("local");
          } else {
            setList([]);
            setActiveId(null);
          }
        } catch {
          setList([]);
          setActiveId(null);
        }
      }
      if (active) setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [user, authReady, supabase]);

  const child = useMemo(
    () => list.find((c) => c.id === activeId) ?? null,
    [list, activeId]
  );

  const setActive = (id: string) => {
    setActiveId(id);
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {}
  };

  const createChild = async (name: string, world: string) => {
    const clean = name.trim() || "Bé Yêu";
    if (user) {
      const { data, error } = await supabase
        .from("children")
        .insert({ user_id: user.id, name: clean, world, stars: 0 })
        .select("id, name, world, stars")
        .single();
      if (error || !data) return null;
      const c = data as Child;
      setList((prev) => [...prev, c]);
      setActive(c.id);
      return c;
    }
    // Khách: lưu localStorage.
    const c: Child = { id: "local", name: clean, world, stars: 0 };
    setList([c]);
    setActiveId("local");
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {}
    return c;
  };

  const deleteChild = async (id: string) => {
    if (user && id !== "local") {
      await supabase.from("children").delete().eq("id", id);
    } else {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    }
    setList((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) setActive(next[0]?.id ?? "");
      return next;
    });
  };

  const addStars = (n: number) => {
    setList((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const next = { ...c, stars: Math.max(0, c.stars + n) };
        if (user && c.id !== "local") {
          // Ghi tiến độ sao vào CSDL (không chặn UI).
          void supabase
            .from("children")
            .update({ stars: next.stars })
            .eq("id", c.id);
        } else {
          try {
            localStorage.setItem(KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      })
    );
  };

  const reset = () => {
    if (!user) {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      setList([]);
      setActiveId(null);
    }
  };

  return (
    <ChildCtx.Provider
      value={{
        child,
        children: list,
        ready,
        createChild,
        setActive,
        deleteChild,
        addStars,
        reset,
      }}
    >
      {kids}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildCtx);
  if (!ctx) throw new Error("useChild must be used within ChildProvider");
  return ctx;
}
