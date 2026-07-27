import type { Metadata } from "next";
import PlayGate from "@/components/LoginGate";

const title = "Tiếng Anh cho bé — Shadowing & Nghe chọn";
const description =
  "Góc Tiếng Anh của Kidrumi: bé luyện nói theo video với Shadowing và chơi Nghe & chọn — nghe từ tiếng Anh rồi chạm vào đúng hình.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tiếng Anh cho bé",
    "shadowing tiếng Anh",
    "luyện nghe nói tiếng Anh trẻ em",
    "học tiếng Anh mầm non",
  ],
  alternates: { canonical: "/english" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/english" },
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /english và lộ trình /english/listen xem tự do; vào từng bài cần đăng nhập.
  return (
    <PlayGate openPaths={["/english", "/english/listen"]}>{children}</PlayGate>
  );
}
