// ---------------------------------------------------------------------------
// Thời gian sử dụng — bản đồ "đường dẫn → trò chơi → môn học" cho Góc ba mẹ.
//
//  - <UsageTracker> đếm thời gian bé ở mỗi trang có trong bảng dưới rồi cộng dồn
//    vào bảng `usage_log` (theo tài khoản, ngày, key trò) qua hàm bump_usage.
//  - Trang /parents đọc lại số liệu, gom theo MÔN để vẽ biểu đồ + bảng.
//
// Thêm trò/màn mới: thêm 1 dòng vào GAMES (đặt đường dẫn CỤ THỂ hơn lên TRƯỚC).
// ---------------------------------------------------------------------------

export type SubjectKey =
  | "tasks"
  | "english"
  | "chinese"
  | "vietnamese"
  | "math"
  | "typing";

export type Subject = { key: SubjectKey; label: string; color: string };

// Thứ tự này cũng là thứ tự các lớp chồng trong biểu đồ cột + chú thích.
export const SUBJECTS: Subject[] = [
  { key: "english", label: "Tiếng Anh", color: "#5aa9e6" },
  { key: "chinese", label: "Tiếng Trung", color: "#ef7fb0" },
  { key: "vietnamese", label: "Tiếng Việt", color: "#b5462f" },
  { key: "math", label: "Toán", color: "#ee6b2f" },
  { key: "typing", label: "Tập gõ phím", color: "#6bbf8a" },
  { key: "tasks", label: "Nhiệm vụ", color: "#f2b23c" },
];

export const SUBJECT_BY_KEY: Record<SubjectKey, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.key, s]),
) as Record<SubjectKey, Subject>;

export type GameDef = {
  prefix: string; // đường dẫn (khớp chính xác hoặc theo tiền tố có "/")
  key: string; // định danh ổn định lưu vào usage_log.game
  label: string; // tên hiển thị trong "Theo từng trò"
  subject: SubjectKey;
};

// Đường dẫn CỤ THỂ hơn phải đứng TRƯỚC (vd /math/sort-shape trước /math/sort,
// mọi /math/* trước /math) để resolveGame chọn đúng trò.
export const GAMES: GameDef[] = [
  // Vườn Toán
  { prefix: "/math/sort-shape", key: "math_sort_shape", label: "Phân loại hình", subject: "math" },
  { prefix: "/math/sort", key: "math_sort", label: "Phân loại vào rổ", subject: "math" },
  { prefix: "/math/compare", key: "math_compare", label: "Cái nào hơn?", subject: "math" },
  { prefix: "/math/pattern", key: "math_pattern", label: "Tiếp nối dãy", subject: "math" },
  { prefix: "/math/shapes", key: "math_shapes", label: "Hình gì đây?", subject: "math" },
  { prefix: "/math/find", key: "math_find", label: "Tìm hình trốn", subject: "math" },
  { prefix: "/math/count", key: "math_count", label: "Đếm cùng bé", subject: "math" },
  { prefix: "/math/order", key: "math_order", label: "Xếp theo thứ tự", subject: "math" },
  { prefix: "/math/gone", key: "math_gone", label: "Vật gì biến mất?", subject: "math" },
  { prefix: "/math/worksheet", key: "math_worksheet", label: "Phiếu bài tập", subject: "math" },
  { prefix: "/math", key: "math_home", label: "Vườn Toán", subject: "math" },
  // Tiếng Anh
  { prefix: "/english/listen", key: "en_listen", label: "Nghe và tìm — English", subject: "english" },
  { prefix: "/english", key: "en_home", label: "Góc Tiếng Anh", subject: "english" },
  // Tiếng Trung
  { prefix: "/chinese/hanzi", key: "zh_hanzi", label: "Bé học chữ Hán", subject: "chinese" },
  { prefix: "/chinese/listen", key: "zh_listen", label: "Nghe và tìm — Tiếng Trung", subject: "chinese" },
  { prefix: "/chinese", key: "zh_home", label: "Góc Tiếng Trung", subject: "chinese" },
  // Tiếng Việt
  { prefix: "/vietnamese/story", key: "vi_story", label: "Nghe hiểu câu chuyện — Tiếng Việt", subject: "vietnamese" },
  { prefix: "/vietnamese", key: "vi_home", label: "Góc Tiếng Việt", subject: "vietnamese" },
  // Shadowing (luyện nghe–nói) — gộp vào Tiếng Anh cho gọn nhóm
  { prefix: "/shadowing", key: "shadowing", label: "Shadowing luyện nói", subject: "english" },
  // Khác
  { prefix: "/typing", key: "typing", label: "Tập gõ phím", subject: "typing" },
  { prefix: "/tasks", key: "tasks", label: "Nhiệm vụ của bé", subject: "tasks" },
];

// Tra ngược từ key trò → định nghĩa (dùng ở trang /parents).
export const GAME_BY_KEY: Record<string, GameDef> = Object.fromEntries(
  GAMES.map((g) => [g.key, g]),
);

// Các nhánh KHÔNG tính thời gian học (khu ba mẹ / đăng nhập / trang chủ).
const EXCLUDE = ["/admin", "/login", "/auth", "/parents"];

// Trang hiện tại thuộc trò nào? null = không tính giờ.
export function resolveGame(pathname: string | null | undefined): GameDef | null {
  if (!pathname || pathname === "/") return null;
  if (EXCLUDE.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return (
    GAMES.find(
      (g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"),
    ) ?? null
  );
}

// Ngày theo GIỜ ĐỊA PHƯƠNG (YYYY-MM-DD) — trùng quy ước với lib/missions.
export function usageDayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
