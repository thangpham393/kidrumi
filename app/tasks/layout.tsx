import type { Metadata } from "next";

const title = "Nhiệm vụ mỗi ngày";
const description =
  "Danh sách việc tốt hằng ngày cho bé: làm xong mỗi việc được một ngôi sao, đủ sao thì mở quà. Nuôi thói quen tốt một cách vui vẻ.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tasks" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/tasks" },
};

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
