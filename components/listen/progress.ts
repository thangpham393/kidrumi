"use client";

// Tiến độ "lộ trình" Nghe & chọn: các chặng đã HOÀN THÀNH của bé, theo ngôn ngữ.
//
// - Đã đăng nhập (có hồ sơ bé thật, id ≠ "local"): lưu Supabase bảng `listen_progress`
//   (một dòng cho mỗi child_id + lang, cột `done` là mảng id chặng) → đồng bộ mọi thiết bị.
//   Vẫn ghi kèm localStorage làm cache để tải tức thì / chạy offline.
// - Chưa đăng nhập (khách) hoặc bảng chưa tạo: dùng localStorage như cũ.
//
// Lần đầu tải trên tài khoản, gộp luôn tiến độ localStorage đang có vào đám mây để
// bé không mất phần đã chơi khi chưa đăng nhập.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthContext";

const LKEY = (lang: string, childId: string | null) =>
  `kidrumi_listen_v1_${lang}_${childId ?? "guest"}`;

function readLocal(lang: string, childId: string | null): Set<string> {
  try {
    const raw = localStorage.getItem(LKEY(lang, childId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeLocal(lang: string, childId: string | null, done: Set<string>) {
  try {
    localStorage.setItem(LKEY(lang, childId), JSON.stringify([...done]));
  } catch {}
}

export function useListenProgress(lang: string, childId: string | null) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  // Chỉ dùng đám mây khi đã đăng nhập VÀ là hồ sơ bé thật (id ≠ "local").
  const cloud = !!user && !!childId && childId !== "local";

  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    if (!cloud) {
      setDone(readLocal(lang, childId));
      setReady(true);
      return;
    }
    setReady(false);
    (async () => {
      const local = readLocal(lang, childId);
      const { data, error } = await supabase
        .from("listen_progress")
        .select("done")
        .eq("child_id", childId)
        .eq("lang", lang)
        .maybeSingle();

      if (error) {
        // Bảng chưa tạo / lỗi mạng → rớt về localStorage, không chặn UI.
        setDone(local);
        setReady(true);
        return;
      }

      const cloudSet = new Set<string>((data?.done as string[]) ?? []);
      const merged = new Set<string>([...cloudSet, ...local]);
      setDone(merged);
      writeLocal(lang, childId, merged);
      setReady(true);

      // Có phần local chưa lên mây → đẩy bản gộp lên (không chặn UI).
      const hasNew = [...local].some((id) => !cloudSet.has(id));
      if (hasNew) {
        void supabase.from("listen_progress").upsert(
          {
            child_id: childId,
            user_id: user!.id,
            lang,
            done: [...merged],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id,lang" },
        );
      }
    })();
  }, [cloud, lang, childId, user, supabase]);

  useEffect(() => {
    // Cố ý nạp (đọc localStorage / gọi Supabase) sau khi mount → tránh lệch hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // Đồng bộ lại khi quay lại tab (đổi thiết bị / tab khác vừa học).
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  const markDone = useCallback(
    (id: string) => {
      setDone((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        writeLocal(lang, childId, next); // cache cục bộ luôn
        if (cloud) {
          void supabase.from("listen_progress").upsert(
            {
              child_id: childId,
              user_id: user!.id,
              lang,
              done: [...next],
              updated_at: new Date().toISOString(),
            },
            { onConflict: "child_id,lang" },
          );
        }
        return next;
      });
    },
    [cloud, lang, childId, user, supabase],
  );

  return { done, ready, markDone };
}
