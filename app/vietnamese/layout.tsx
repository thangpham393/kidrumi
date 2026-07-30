import type { Metadata } from "next";
import PlayGate from "@/components/LoginGate";

const title = "Tiếng Việt cho bé — Nghe hiểu câu chuyện";
const description =
  "Góc Tiếng Việt của KATKID: bé nghe một câu chuyện ngắn rồi xếp các bức tranh theo đúng thứ tự trước sau.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tiếng Việt cho bé",
    "nghe hiểu câu chuyện",
    "luyện nghe tiếng Việt trẻ em",
    "học tiếng Việt mầm non",
  ],
  alternates: { canonical: "/vietnamese" },
  openGraph: { title: `${title} — KATKID`, description, url: "/vietnamese" },
};

export default function VietnameseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /vietnamese (chọn trò) + /vietnamese/story (bản đồ chọn truyện) xem tự do; vào chơi
  // từng truyện thì cần đăng nhập.
  return <PlayGate openPaths={["/vietnamese", "/vietnamese/story"]}>{children}</PlayGate>;
}
