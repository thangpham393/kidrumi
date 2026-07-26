"use client";

// Tiến độ shadowing của bé, lưu trên CSDL (Supabase) — CHỈ khi đã đăng nhập.
// Mỗi video giữ mảng chỉ số câu ĐÃ nghe (unique) để tính "đã nghe / tổng câu",
// cùng mốc cập nhật để sắp xếp tab "Đang học" (mới học lên đầu). Chưa đăng nhập thì
// không lưu và không thấy tab "Đang học".

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lang } from "./data";

export type Entry = { heard: number[]; total: number; ts: number };
export type Store = Record<string, Entry>; // key = video.id

// Nạp toàn bộ tiến độ của 1 bé (RLS đảm bảo chỉ lấy dữ liệu của tài khoản hiện tại).
export async function fetchProgress(childId: string): Promise<Store> {
  const supabase = createClient();
  const { data } = await supabase
    .from("shadowing_progress")
    .select("video_id, heard, total, updated_at")
    .eq("child_id", childId);
  const store: Store = {};
  for (const r of data ?? []) {
    store[r.video_id as string] = {
      heard: (r.heard as number[]) ?? [],
      total: (r.total as number) ?? 0,
      ts: new Date(r.updated_at as string).getTime(),
    };
  }
  return store;
}

// Nạp danh sách câu đã nghe của 1 video (để cộng dồn khi bé học tiếp).
export async function fetchVideoHeard(
  childId: string,
  videoId: string
): Promise<number[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("shadowing_progress")
    .select("heard")
    .eq("child_id", childId)
    .eq("video_id", videoId)
    .maybeSingle();
  return (data?.heard as number[]) ?? [];
}

// Ghi (upsert) tiến độ 1 video. Ghi trọn mảng heard đã gộp ở phía client.
export async function saveProgress(params: {
  childId: string;
  userId: string;
  videoId: string;
  lang: Lang;
  heard: number[];
  total: number;
}): Promise<void> {
  const supabase = createClient();
  await supabase.from("shadowing_progress").upsert(
    {
      child_id: params.childId,
      user_id: params.userId,
      video_id: params.videoId,
      lang: params.lang,
      heard: params.heard,
      total: params.total,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id,video_id" }
  );
}

// Số câu đã nghe của 1 video (0 nếu chưa học).
export function heardCount(entry: Entry | undefined): number {
  return entry?.heard.length ?? 0;
}

// Hook đọc toàn bộ tiến độ của bé. childId = null (chưa đăng nhập / chưa có hồ sơ)
// → trả về rỗng, không gọi mạng. Tự tải lại khi quay lại tab để đồng bộ nhiều thiết bị.
export function useShadowingProgress(childId: string | null): {
  store: Store;
  ready: boolean;
} {
  const [store, setStore] = useState<Store>({});
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    if (!childId) {
      setStore({});
      setReady(true);
      return;
    }
    setReady(false);
    fetchProgress(childId).then((s) => {
      setStore(s);
      setReady(true);
    });
  }, [childId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!childId) return;
    const onFocus = () => reload();
    const onVis = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [childId, reload]);

  return { store, ready };
}
