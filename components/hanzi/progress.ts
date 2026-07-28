"use client";

import { useCallback, useEffect, useState } from "react";
import { STEPS, type Step } from "@/app/chinese/hanzi/data";

// Tiến độ học chữ Hán, lưu localStorage (khách vẫn giữ được sau khi tải lại).
// Mỗi chữ lưu danh sách bước đã hoàn thành, vd { "上": ["认","学"] }.
// Đồng bộ Supabase để giai đoạn sau — hiện đủ cho luồng chơi + cộng sao.

const KEY = "kidrumi_hanzi_progress";
type Store = Record<string, Step[]>;

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

export function useHanziProgress() {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStore(read());
    setReady(true);
  }, []);

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
  const markStep = useCallback((char: string, step: Step): boolean => {
    let fresh = false;
    setStore((prev) => {
      const cur = prev[char] ?? [];
      if (cur.includes(step)) return prev;
      fresh = true;
      const next = { ...prev, [char]: [...cur, step] };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    return fresh;
  }, []);

  return { ready, stepsDone, isStepDone, charDone, starsOf, markStep };
}
