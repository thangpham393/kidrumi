"use client";

// ---------------------------------------------------------------------------
// Nhiệm vụ mỗi ngày — 10 nhiệm vụ tự sinh, tự ghi nhận khi bé làm hoạt động.
//
// Cách hoạt động:
//  - Mỗi hoạt động (video, nghe & chọn, chữ Hán, toán, gõ phím…) khi bé HOÀN
//    THÀNH sẽ gọi `record(kind, unit)` → ghi 1 dòng vào bảng `activity_log`
//    (unique theo child+ngày+loại+đơn vị, nên làm lại cùng đơn vị không ghi thêm).
//  - Trang /tasks đếm số ĐƠN VỊ khác nhau mỗi loại trong NGÀY rồi so với danh
//    mục MISSIONS để biết nhiệm vụ nào đã xong.
//  - "Qua ngày mới" tự reset vì tiến độ được khoá theo `day` (giờ địa phương).
// ---------------------------------------------------------------------------

import { useCallback, useMemo } from "react";
import { useChild } from "@/components/ChildContext";
import { useAuth } from "@/components/AuthContext";
import { createClient } from "@/lib/supabase/client";

// Các loại hoạt động được ghi nhận.
export type ActKind =
  | "shadow_en"
  | "shadow_zh"
  | "listen_en"
  | "listen_zh"
  | "hanzi"
  | "vietnamese"
  | "en_story"
  | "math"
  | "typing";

export type Mission = {
  key: string; // định danh nhiệm vụ (ổn định, dùng cho lịch sử)
  icon: string;
  label: string;
  sources: ActKind[]; // cộng dồn số đơn vị của các loại này
  need: number; // cần bao nhiêu đơn vị để xong
  href: string; // bấm vào → đi tới hoạt động
};

// 10 nhiệm vụ mặc định mỗi ngày. Thứ tự = thứ tự hiển thị.
export const MISSIONS: Mission[] = [
  { key: "en_shadow", icon: "🎬", label: "Xem 1 video Shadowing tiếng Anh", sources: ["shadow_en"], need: 1, href: "/shadowing?lang=en" },
  { key: "en_listen", icon: "🎧", label: "Hoàn thành 1 bài Nghe & chọn tiếng Anh", sources: ["listen_en"], need: 1, href: "/english/listen" },
  { key: "zh_shadow", icon: "🎬", label: "Xem 1 video Shadowing tiếng Trung", sources: ["shadow_zh"], need: 1, href: "/shadowing?lang=zh" },
  { key: "zh_listen", icon: "🎧", label: "Hoàn thành 1 bài Nghe & chọn tiếng Trung", sources: ["listen_zh"], need: 1, href: "/chinese/listen" },
  { key: "hanzi", icon: "🈶", label: "Học 1 chữ Hán (đủ 4 bước)", sources: ["hanzi"], need: 1, href: "/chinese/hanzi" },
  { key: "vi_story", icon: "📖", label: "Nghe hiểu 1 câu chuyện tiếng Việt", sources: ["vietnamese"], need: 1, href: "/vietnamese/story" },
  { key: "math1", icon: "🔢", label: "Chơi 1 trò Vườn Toán", sources: ["math"], need: 1, href: "/math" },
  { key: "math2", icon: "🧮", label: "Chơi thêm 1 trò Vườn Toán khác", sources: ["math"], need: 2, href: "/math" },
  { key: "typing", icon: "⌨️", label: "Tập gõ phím 1 lượt", sources: ["typing"], need: 1, href: "/typing" },
  { key: "shadow_more", icon: "🌟", label: "Xem thêm 1 video Shadowing (Anh hoặc Trung)", sources: ["shadow_en", "shadow_zh"], need: 3, href: "/shadowing" },
];

// Số đơn vị khác nhau đã làm trong ngày, theo từng loại.
export type ActCounts = Partial<Record<ActKind, number>>;

export type MissionState = Mission & { have: number; done: boolean };

// Tính trạng thái 10 nhiệm vụ từ số liệu đếm được.
export function evaluateMissions(counts: ActCounts): MissionState[] {
  return MISSIONS.map((m) => {
    const have = m.sources.reduce((s, k) => s + (counts[k] ?? 0), 0);
    return { ...m, have: Math.min(have, m.need), done: have >= m.need };
  });
}

// Ngày theo GIỜ ĐỊA PHƯƠNG (YYYY-MM-DD) — để "qua ngày" reset lúc nửa đêm ở VN.
export function localDayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Gom các dòng activity_log của MỘT ngày thành số đếm đơn vị/ loại.
export type LogRow = { kind: string; unit: string };
export function countByKind(rows: LogRow[]): ActCounts {
  const seen = new Map<string, Set<string>>(); // kind -> tập unit
  for (const r of rows) {
    const set = seen.get(r.kind) ?? new Set<string>();
    set.add(r.unit);
    seen.set(r.kind, set);
  }
  const out: ActCounts = {};
  for (const [k, set] of seen) out[k as ActKind] = set.size;
  return out;
}

// Hook dùng trong mọi trang hoạt động: gọi record khi bé HOÀN THÀNH 1 đơn vị.
// Khách (chưa đăng nhập) hoặc bé "local" → bỏ qua (nhiệm vụ cần đăng nhập).
export function useRecordActivity() {
  const { child } = useChild();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const childId = child?.id ?? null;
  const userId = user?.id ?? null;

  return useCallback(
    (kind: ActKind, unit: string = "") => {
      if (!userId || !childId || childId === "local") return;
      void supabase
        .from("activity_log")
        .upsert(
          { child_id: childId, user_id: userId, day: localDayISO(), kind, unit },
          { onConflict: "child_id,day,kind,unit", ignoreDuplicates: true },
        )
        .then(({ error }) => {
          if (error) console.error("Ghi nhận nhiệm vụ thất bại:", error.message);
        });
    },
    [supabase, childId, userId],
  );
}
