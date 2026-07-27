// Thứ tự chủ đề + icon cho "lộ trình" của trò Nghe & chọn.
// Cả tiếng Anh lẫn tiếng Trung dùng CHUNG bộ key nhóm (xem app/*/listen/data.ts),
// nên chỉ cần một bảng thứ tự ở đây; mỗi ngôn ngữ tự nạp từ vựng của mình.
// Sắp từ dễ/vui → khó dần cho bé tiền tiểu học.

export type TopicMeta = {
  key: string; // trùng key nhóm trong data.ts
  icon: string; // emoji minh hoạ trên dải + đốt lộ trình
  label: string; // nhãn ngắn tiếng Việt (đầu mỗi đốt)
};

export const TOPIC_ORDER: TopicMeta[] = [
  { key: "animals", icon: "🐶", label: "Con vật" },
  { key: "food", icon: "🍎", label: "Đồ ăn" },
  { key: "colors", icon: "🎨", label: "Màu sắc" },
  { key: "numbers", icon: "🔢", label: "Số đếm" },
  { key: "body", icon: "👋", label: "Cơ thể" },
  { key: "family", icon: "👨‍👩‍👧", label: "Gia đình" },
  { key: "clothes", icon: "👕", label: "Quần áo" },
  { key: "toys", icon: "🧸", label: "Đồ chơi" },
  { key: "vehicles", icon: "🚗", label: "Phương tiện" },
  { key: "school", icon: "✏️", label: "Học tập" },
  { key: "nature", icon: "🌳", label: "Thiên nhiên" },
  { key: "weather", icon: "🌈", label: "Thời tiết" },
  { key: "music", icon: "🎵", label: "Nhạc cụ" },
];
