"use client";

// Tiến độ "Luyện tập tổng hợp" của từng chùm chữ (mỗi đơn vị 1 lượt thử thách 5 chữ).
// Lưu localStorage theo bé: điểm cao nhất + đã nhận sao thưởng chưa. Dùng để hiện
// dấu tick 🏆 trên thẻ luyện tập ở màn danh sách chữ, và tránh farm sao khi chơi lại.
//
// Cố tình chỉ dùng localStorage (không đám mây) cho gọn — tiến độ 4 bước học chữ đã
// đồng bộ Supabase; phần luyện tập chỉ là thưởng thêm nên cache cục bộ là đủ.

import { useCallback, useEffect, useState } from "react";

export type QuizRec = { best: number; total: number; awarded: boolean };
type Store = Record<string, QuizRec>; // unitId -> kết quả tốt nhất

const LKEY = (childId: string | null) => `kidrumi_hanzi_quiz_${childId ?? "guest"}`;

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

export function useQuizProgress(childId: string | null) {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Nạp sau khi mount → tránh lệch hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStore(readLocal(childId));
    setReady(true);
  }, [childId]);

  const recOf = useCallback((unitId: string): QuizRec | undefined => store[unitId], [store]);
  const passed = useCallback((unitId: string) => !!store[unitId], [store]);

  // Ghi kết quả 1 lượt. Trả về true nếu đây là lần ĐẦU hoàn thành (để cộng sao thưởng).
  const save = useCallback(
    (unitId: string, score: number, total: number): boolean => {
      const cur = store[unitId];
      const firstTime = !cur?.awarded;
      const next: Store = {
        ...store,
        [unitId]: { best: Math.max(cur?.best ?? 0, score), total, awarded: true },
      };
      setStore(next);
      writeLocal(childId, next);
      return firstTime;
    },
    [store, childId],
  );

  return { ready, recOf, passed, save };
}
