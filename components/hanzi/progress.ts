"use client";

// Tiến độ học chữ Hán của bé. Mỗi chữ giữ danh sách bước đã hoàn thành,
// vd { "上": ["认","学"] }.
//
// - Đã đăng nhập (hồ sơ bé thật, id ≠ "local"): lưu Supabase bảng `hanzi_progress`
//   (một dòng cho mỗi bé, cột `steps` là JSON map chữ → mảng bước) → đồng bộ mọi thiết bị.
//   Vẫn ghi kèm localStorage làm cache để tải tức thì / chạy offline.
// - Chưa đăng nhập (khách) hoặc bảng chưa tạo: dùng localStorage như cũ.
//
// Lần đầu tải trên tài khoản, gộp luôn tiến độ localStorage đang có vào đám mây để
// bé không mất phần đã chơi khi chưa đăng nhập.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { STEPS, type Step } from "@/app/chinese/hanzi/data";

type Store = Record<string, Step[]>;

const LKEY = (childId: string | null) =>
  `kidrumi_hanzi_progress_${childId ?? "guest"}`;

function readLocal(childId: string | null): Store {
  try {
    const raw = localStorage.getItem(LKEY(childId));
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeLocal(childId: string | null, store: Store) {
  try {
    localStorage.setItem(LKEY(childId), JSON.stringify(store));
  } catch {}
}

// Gộp 2 map: hợp (union) các bước đã xong của từng chữ, giữ đúng thứ tự 认/学/练/写.
function merge(a: Store, b: Store): Store {
  const out: Store = {};
  for (const char of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const set = new Set<Step>([...(a[char] ?? []), ...(b[char] ?? [])]);
    out[char] = STEPS.filter((s) => set.has(s));
  }
  return out;
}

// Có phần trong `local` mà `cloud` chưa có? (để quyết định đẩy bản gộp lên mây)
function hasExtra(local: Store, cloud: Store): boolean {
  return Object.entries(local).some(([char, steps]) =>
    steps.some((s) => !(cloud[char] ?? []).includes(s)),
  );
}

export function useHanziProgress(childId: string | null) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  // Chỉ dùng đám mây khi đã đăng nhập VÀ là hồ sơ bé thật (id ≠ "local").
  const cloud = !!user && !!childId && childId !== "local";

  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  const push = useCallback(
    (next: Store) => {
      if (!cloud) return;
      // .then() để Supabase thực sự gửi request (query chạy lười).
      supabase
        .from("hanzi_progress")
        .upsert(
          {
            child_id: childId,
            user_id: user!.id,
            steps: next,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "child_id" },
        )
        .then(({ error }) => {
          if (error) console.error("Lưu tiến độ chữ Hán thất bại:", error.message);
        });
    },
    [cloud, childId, user, supabase],
  );

  const reload = useCallback(() => {
    const local = readLocal(childId);
    if (!cloud) {
      setStore(local);
      setReady(true);
      return;
    }
    setReady(false);
    (async () => {
      const { data, error } = await supabase
        .from("hanzi_progress")
        .select("steps")
        .eq("child_id", childId)
        .maybeSingle();

      if (error) {
        // Bảng chưa tạo / lỗi mạng → rớt về localStorage, không chặn UI.
        setStore(local);
        setReady(true);
        return;
      }

      const cloudStore = (data?.steps as Store) ?? {};
      const merged = merge(cloudStore, local);
      setStore(merged);
      writeLocal(childId, merged);
      setReady(true);

      // Có phần local chưa lên mây → đẩy bản gộp lên.
      if (hasExtra(local, cloudStore)) push(merged);
    })();
  }, [cloud, childId, supabase, push]);

  useEffect(() => {
    // Cố ý nạp sau khi mount → tránh lệch hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // Đồng bộ lại khi quay lại tab (đổi thiết bị / tab khác vừa học).
    const onFocus = () => reload();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload]);

  const stepsDone = useCallback(
    (char: string): Step[] => store[char] ?? [],
    [store],
  );

  const isStepDone = useCallback(
    (char: string, step: Step) => (store[char] ?? []).includes(step),
    [store],
  );

  const charDone = useCallback(
    (char: string) => STEPS.every((s) => (store[char] ?? []).includes(s)),
    [store],
  );

  const starsOf = useCallback(
    (char: string) => (store[char] ?? []).length,
    [store],
  );

  // Đánh dấu 1 bước xong. Trả về true nếu đây là lần ĐẦU xong bước đó
  // (để nơi gọi cộng sao + khen). Idempotent nếu đã xong.
  const markStep = useCallback(
    (char: string, step: Step): boolean => {
      let fresh = false;
      setStore((prev) => {
        const cur = prev[char] ?? [];
        if (cur.includes(step)) return prev;
        fresh = true;
        const next = {
          ...prev,
          [char]: STEPS.filter((s) => s === step || cur.includes(s)),
        };
        writeLocal(childId, next); // cache cục bộ luôn
        push(next); // đồng bộ đám mây (nếu đã đăng nhập)
        return next;
      });
      return fresh;
    },
    [childId, push],
  );

  return { ready, stepsDone, isStepDone, charDone, starsOf, markStep };
}
