"use client";

// ---------------------------------------------------------------------------
// Đếm thời gian bé dùng mỗi trò rồi cộng dồn vào usage_log (xem lib/usage.ts).
// Gắn 1 lần ở layout. Chỉ đếm khi đã đăng nhập (thời gian tính theo tài khoản).
//  - Vào 1 trò → ghi 1 "lượt" (sessions +1).
//  - Đếm giây khi tab đang HIỂN THỊ; cộng dồn định kỳ + khi rời trang / ẩn tab.
// ---------------------------------------------------------------------------

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useChild } from "./ChildContext";
import { createClient } from "@/lib/supabase/client";
import { resolveGame, usageDayISO } from "@/lib/usage";

const FLUSH_MS = 20_000; // cộng dồn xuống CSDL mỗi 20 giây

export default function UsageTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { child } = useChild();
  const supabase = useMemo(() => createClient(), []);

  const userId = user?.id ?? null;
  const childId = child?.id && child.id !== "local" ? child.id : null;

  // Giữ giá trị mới nhất cho closure của effect mà không tạo lại effect.
  const meta = useRef({ userId, childId });
  useEffect(() => {
    meta.current = { userId, childId };
  }, [userId, childId]);

  const flush = useCallback(
    (game: string, seconds: number, sessions: number) => {
      const { userId: uid, childId: cid } = meta.current;
      if (!uid || !game || (seconds <= 0 && sessions <= 0)) return;
      void supabase.rpc("bump_usage", {
        p_game: game,
        p_day: usageDayISO(),
        p_seconds: Math.round(seconds),
        p_sessions: sessions,
        p_child: cid,
      });
    },
    [supabase],
  );

  useEffect(() => {
    const game = resolveGame(pathname);
    if (!userId || !game) return;

    let secs = 0;
    flush(game.key, 0, 1); // ghi 1 lượt khi vào trò

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") secs += 1;
    }, 1000);

    const push = setInterval(() => {
      if (secs > 0) {
        flush(game.key, secs, 0);
        secs = 0;
      }
    }, FLUSH_MS);

    // Ẩn tab / rời trang: chốt phần còn lại ngay (tránh mất khi đóng máy).
    const onHide = () => {
      if (document.visibilityState === "hidden" && secs > 0) {
        flush(game.key, secs, 0);
        secs = 0;
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      clearInterval(tick);
      clearInterval(push);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      if (secs > 0) flush(game.key, secs, 0);
    };
  }, [pathname, userId, flush]);

  return null;
}
