"use client";

// Tiến độ "lộ trình" Nghe & chọn: các chặng đã HOÀN THÀNH của bé, theo ngôn ngữ.
// Lưu localStorage (chạy cả khi chưa đăng nhập, giống math/typing). Khoá theo id bé
// để mỗi bé một tiến độ. Mở khoá tuyến tính do trang lộ trình tự tính từ tập này.

import { useCallback, useEffect, useState } from "react";

const KEY = (lang: string, childId: string | null) =>
  `kidrumi_listen_v1_${lang}_${childId ?? "guest"}`;

function read(lang: string, childId: string | null): Set<string> {
  try {
    const raw = localStorage.getItem(KEY(lang, childId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function useListenProgress(lang: string, childId: string | null) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  // Nạp lại mỗi khi đổi bé/ngôn ngữ, và khi quay lại tab (đồng bộ nhiều tab).
  const reload = useCallback(() => {
    setDone(read(lang, childId));
    setReady(true);
  }, [lang, childId]);

  useEffect(() => {
    // Đọc localStorage phải ở client (tránh lệch hydration) → cố ý setState sau mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
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
        try {
          localStorage.setItem(KEY(lang, childId), JSON.stringify([...next]));
        } catch {}
        return next;
      });
    },
    [lang, childId],
  );

  return { done, ready, markDone };
}
