import type { Metadata } from "next";
import PlayGate from "@/components/LoginGate";

const title = "Tiếng Anh cho bé — Shadowing, Nghe chọn & Story in Order";
const description =
  "Góc Tiếng Anh của KATKID: bé luyện nói theo video với Shadowing, chơi Nghe & chọn — nghe từ tiếng Anh rồi chạm vào đúng hình, và Story in Order — nghe truyện tiếng Anh rồi xếp tranh đúng thứ tự.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tiếng Anh cho bé",
    "shadowing tiếng Anh",
    "luyện nghe nói tiếng Anh trẻ em",
    "học tiếng Anh mầm non",
    "story in order",
    "nghe hiểu truyện tiếng Anh",
  ],
  alternates: { canonical: "/english" },
  openGraph: { title: `${title} — KATKID`, description, url: "/english" },
};

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /english, lộ trình /english/listen và bản đồ /english/story xem tự do; vào từng bài /
  // từng truyện thì cần đăng nhập.
  return (
    <PlayGate openPaths={["/english", "/english/listen", "/english/story"]}>
      {children}
    </PlayGate>
  );
}
