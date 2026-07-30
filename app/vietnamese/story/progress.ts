"use client";

// Tiến độ "Nghe hiểu câu chuyện": tập truyện bé đã xếp đúng, để bản đồ mở khoá dần.
//
// Nguồn dữ liệu:
//  - Đã đăng nhập: đọc thẳng từ bảng `activity_log` của hệ NHIỆM VỤ (kind="vietnamese",
//    mỗi lần xong 1 truyện đã ghi 1 dòng unit=<storyId>). Nhờ vậy tiến độ ĐỒNG BỘ chéo
//    thiết bị và DÙNG CHUNG một nguồn với Nhiệm vụ — không cần bảng riêng.
//  - Chưa đăng nhập (khách): localStorage theo máy.
// Luôn hợp nhất thêm localStorage để cập nhật lạc quan (truyện vừa xong hiện ngay, kể cả
// khi ghi CSDL còn đang bay).

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STORY_ORDER } from "./data";

const keyOf = (childId: string | null | undefined) =>
  `kidrumi_story_done_${childId || "local"}`;

export function getDoneStories(childId: string | null | undefined): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(keyOf(childId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function markStoryDone(
  childId: string | null | undefined,
  storyId: string,
): string[] {
  const cur = getDoneStories(childId);
  if (!cur.includes(storyId)) cur.push(storyId);
  try {
    localStorage.setItem(keyOf(childId), JSON.stringify(cur));
  } catch {}
  return cur;
}

// Chỉ số truyện đầu tiên CHƯA xong theo thứ tự tuyến tính — chính là "truyện tiếp theo".
// Trả về STORY_ORDER.length nếu bé đã xong hết.
export function nextIndex(done: string[]): number {
  const set = new Set(done);
  const i = STORY_ORDER.findIndex((id) => !set.has(id));
  return i === -1 ? STORY_ORDER.length : i;
}

// Truyện được mở khoá khi nó đã xong HOẶC là truyện tiếp theo cần chơi (mở dần).
export function isUnlocked(storyId: string, done: string[]): boolean {
  const idx = STORY_ORDER.indexOf(storyId);
  if (idx < 0) return false;
  return idx <= nextIndex(done);
}

// ---- Đồng bộ Supabase (dùng chung bảng activity_log với Nhiệm vụ) ----

// Suy ra tập truyện đã xong từ activity_log (kind="vietnamese", gộp MỌI ngày).
// RLS đảm bảo chỉ lấy dữ liệu của tài khoản hiện tại.
export async function fetchDoneStories(childId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("unit")
    .eq("child_id", childId)
    .eq("kind", "vietnamese");
  const valid = new Set(STORY_ORDER);
  const out = new Set<string>();
  for (const r of data ?? []) {
    const u = r.unit as string;
    if (valid.has(u)) out.add(u);
  }
  return [...out];
}

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

// Hook đọc tập truyện đã xong của bé. `canSync` = đã đăng nhập & có hồ sơ bé thật.
// Trả done = null lúc đầu (khớp SSR, tránh lệch hydration). Tự tải lại khi quay lại tab
// để đồng bộ nhiều thiết bị (giống useShadowingProgress).
export function useStoryDone(
  childId: string | null,
  canSync: boolean,
): { done: string[] | null; reload: () => void } {
  const [done, setDone] = useState<string[] | null>(null);

  const reload = useCallback(() => {
    const local = getDoneStories(childId);
    if (!canSync || !childId) {
      setDone(local);
      return;
    }
    fetchDoneStories(childId)
      .then((remote) => setDone(union(local, remote)))
      .catch(() => setDone(local));
  }, [childId, canSync]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  useEffect(() => {
    if (!canSync || !childId) return;
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
  }, [childId, canSync, reload]);

  return { done, reload };
}
