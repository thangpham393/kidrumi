/* ---------------------------------------------------------------------------
   Cấu hình "thế giới" cho Vườn Nhiệm Vụ.
   Mỗi bé chọn 1 thế giới ở hồ sơ; toàn bộ nền, màu sắc, tên bạn đồng hành và
   loại hạt nền động (ambient) đổi theo. Ý tưởng khung tham khảo mykidspace.online.

   Ảnh (nền + nhân vật) theo quy ước đường dẫn:
     /themes/<key>/bg.webp        — ảnh nền toàn màn
     /themes/<key>/swim1..4.webp  — 4 khung hình đứng yên (bơi/lắc lư)
     /themes/<key>/cheer1..4.webp — 4 khung hình ăn mừng khi bé xong việc
   Khi CHƯA có ảnh, nền rớt về gradient (themeBgGradient) và bạn đồng hành
   rớt về nhân vật SVG sinh động riêng của thế giới (components/BuddyArt.tsx).
   Chỉ cần thả .webp vào public/themes/<key>/ là nhân vật flipbook ảnh thật tự
   bật lên thay SVG, không phải sửa code.
--------------------------------------------------------------------------- */

export type AmbientKind = "bubbles" | "stars" | "clouds" | "leaves" | "speed" | "sparkles";

export type WorldTheme = {
  key: string;
  label: string;
  emoji: string;
  buddyName: string;
  greeting: string;
  praise: string[];
  ambient: AmbientKind;
  /** Màu chủ đạo / đậm / phụ — dùng cho hero, thanh năng lượng, nền dự phòng. */
  primary: string;
  dark: string;
  secondary: string;
  /** Màu chữ trên nền tối (tiêu đề đặt trên ảnh nền). */
  headerInk: string;
};

export const WORLD_THEMES: Record<string, WorldTheme> = {
  ocean: {
    key: "ocean",
    label: "Đại dương",
    emoji: "🐙",
    buddyName: "Mimo Bạch Tuộc",
    greeting: "Chào bé! Mình cùng lặn xuống làm một việc thật dễ nhé? 🫧",
    praise: ["Tuyệt quá! Thêm một viên ngọc lấp lánh! 🫧", "Mimo vui lắm, bé giỏi ghê! 🐙", "Woa, đại dương sáng hơn rồi nè! ✨"],
    ambient: "bubbles",
    primary: "#7469ed", dark: "#4d63bd", secondary: "#67d3df", headerInk: "#ffffff",
  },
  space: {
    key: "space",
    label: "Vũ trụ",
    emoji: "🚀",
    buddyName: "Roki Tên Lửa",
    greeting: "Sẵn sàng cất cánh chưa bé? Mình chọn một nhiệm vụ dễ trước nhé 🚀",
    praise: ["Vút! Thêm một vì sao sáng! ⭐", "Roki khen bé giỏi nè! 🚀", "Woa, cả dải ngân hà lấp lánh! ✨"],
    ambient: "stars",
    primary: "#7867d8", dark: "#493f9b", secondary: "#d687e7", headerInk: "#ffffff",
  },
  sunny: {
    key: "sunny",
    label: "Vườn nắng",
    emoji: "☀️",
    buddyName: "Sunny Mặt Trời",
    greeting: "Chào ngày mới! Mình làm một việc nhỏ để tỏa sáng nhé ☀️",
    praise: ["Rực rỡ! Thêm một tia nắng! ☀️", "Sunny khen bé nè! 🌻", "Woa, cả khu vườn ấm áp hơn rồi! ✨"],
    ambient: "clouds",
    primary: "#efa128", dark: "#cb712d", secondary: "#ffd858", headerInk: "#34739c",
  },
  valley: {
    key: "valley",
    label: "Thung lũng",
    emoji: "🦕",
    buddyName: "Tí-Rex Dũng Cảm",
    greeting: "Gừ gừ! Bé và Tí-Rex cùng chinh phục một việc nhỏ nhé 🦕",
    praise: ["Gừ! Thêm một bước chân dũng cảm! 🦕", "Tí-Rex gầm khen bé nè! 🦖", "Woa, cả thung lũng reo hò! ✨"],
    ambient: "leaves",
    primary: "#62a95f", dark: "#3e7e4d", secondary: "#e5b44f", headerInk: "#42604b",
  },
  race: {
    key: "race",
    label: "Đường đua",
    emoji: "🏁",
    buddyName: "Rubi Xe Đua",
    greeting: "Khởi động máy nào bé! Mình bắt đầu bằng một vòng thật dễ nhé 🏁",
    praise: ["Vèo! Về đích thêm một vòng! 🏎️", "Rubi bấm còi khen bé! 🏁", "Woa, tay đua cừ khôi! ✨"],
    ambient: "speed",
    primary: "#ef6758", dark: "#ba4d47", secondary: "#ffb44f", headerInk: "#44475f",
  },
  kingdom: {
    key: "kingdom",
    label: "Vương quốc",
    emoji: "👑",
    buddyName: "Công chúa nhỏ",
    greeting: "Chào công chúa nhỏ! Mình cùng làm việc tốt nhé 👑",
    praise: ["Tuyệt! Thêm một viên kim cương! 💎", "Cả vương quốc khen bé nè! 👑", "Woa, lấp lánh cả lâu đài! ✨"],
    ambient: "sparkles",
    primary: "#e77bb2", dark: "#b2508a", secondary: "#c9a7f5", headerInk: "#7c3f66",
  },
  robot: {
    key: "robot",
    label: "Thành phố Robot",
    emoji: "🤖",
    buddyName: "Robo Tí Hon",
    greeting: "Bíp bíp! Nạp năng lượng bằng một việc nhỏ nhé 🤖",
    praise: ["Bíp! Nạp thêm một pin năng lượng! 🔋", "Robo nhấp nháy khen bé! 🤖", "Woa, cả thành phố sáng đèn! ✨"],
    ambient: "sparkles",
    primary: "#4fa3d8", dark: "#33689b", secondary: "#9fd6e8", headerInk: "#2d4a63",
  },
  carrot: {
    key: "carrot",
    label: "Vườn cà rốt",
    emoji: "🐰",
    buddyName: "Bông Thỏ Hồng",
    greeting: "Chào bé! Mình cùng nhảy chân sáo làm một việc nhỏ nhé? 🥕",
    praise: ["Nhảy cẫng! Thêm một củ cà rốt! 🥕", "Bông Thỏ vẫy tai khen bé! 🐰", "Woa, cả vườn xanh mướt! ✨"],
    ambient: "clouds",
    primary: "#ec7fae", dark: "#bc5183", secondary: "#8fce9b", headerInk: "#8a4663",
  },
  deepsea: {
    key: "deepsea",
    label: "Biển Sâu",
    emoji: "🐬",
    buddyName: "Mập Xanh",
    greeting: "Chào bé! Cùng Mập Xanh lặn xuống săn một việc nhỏ nhé? 🦈",
    praise: ["Ngoạm! Thêm một đồng vàng lấp lánh! 🪙", "Mập Xanh quẫy đuôi khen bé nè! 🦈", "Woa, thợ săn kho báu cừ khôi! ✨"],
    ambient: "bubbles",
    primary: "#3f8fd2", dark: "#2c6399", secondary: "#7fd0e8", headerInk: "#ffffff",
  },
};

/** Thế giới mặc định (khớp fallback worlds[7] = carrot của trang tasks). */
export const DEFAULT_WORLD = "carrot";

export function getTheme(world: string | null | undefined): WorldTheme {
  return WORLD_THEMES[world ?? ""] ?? WORLD_THEMES[DEFAULT_WORLD];
}

/** Đường dẫn ảnh theo thế giới + "tâm trạng" (bg / swim1.. / cheer1..). */
export function themeAsset(world: string, mood: string): string {
  return `/themes/${world}/${mood}.webp`;
}

/** Gradient nền dự phòng khi chưa có ảnh /themes/<key>/bg.webp. */
export function themeBgGradient(t: WorldTheme): string {
  return `radial-gradient(120% 90% at 50% -10%, ${t.secondary} 0%, ${t.primary} 42%, ${t.dark} 100%)`;
}
