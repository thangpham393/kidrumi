// Tiến độ "Nghe hiểu câu chuyện": lưu các truyện bé đã xếp đúng, theo từng hồ sơ bé.
// Dùng localStorage (chạy cho cả khách chưa đăng nhập) — bản đồ chương mở khoá dần dựa
// vào tập truyện đã xong này. Khoá tách theo childId để mỗi bé có tiến độ riêng.

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
