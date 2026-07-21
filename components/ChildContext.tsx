"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Child = {
  name: string;
  world: string; // key of a world theme
  stars: number;
};

type Ctx = {
  child: Child | null;
  ready: boolean;
  createChild: (name: string, world: string) => void;
  addStars: (n: number) => void;
  reset: () => void;
};

const ChildCtx = createContext<Ctx | null>(null);
const KEY = "kidrumi_child";

export function ChildProvider({ children }: { children: ReactNode }) {
  const [child, setChild] = useState<Child | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChild(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = (c: Child | null) => {
    setChild(c);
    try {
      if (c) localStorage.setItem(KEY, JSON.stringify(c));
      else localStorage.removeItem(KEY);
    } catch {}
  };

  const createChild = (name: string, world: string) =>
    persist({ name: name.trim() || "Bé Yêu", world, stars: 0 });

  const addStars = (n: number) =>
    setChild((c) => {
      if (!c) return c;
      const next = { ...c, stars: c.stars + n };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  const reset = () => persist(null);

  return (
    <ChildCtx.Provider value={{ child, ready, createChild, addStars, reset }}>
      {children}
    </ChildCtx.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildCtx);
  if (!ctx) throw new Error("useChild must be used within ChildProvider");
  return ctx;
}
