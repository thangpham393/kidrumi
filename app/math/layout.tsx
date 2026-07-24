import type { Metadata } from "next";

const title = "Vườn Toán — Chơi mà học cho bé";
const description =
  "Vườn Toán của Kidrumi: bé chơi phân loại, so sánh, đếm, nhận biết hình theo từng độ tuổi và làm phiếu bài tập cộng trừ nhân chia.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "học toán cho bé",
    "toán mầm non",
    "trò chơi toán trẻ em",
    "toán tiền tiểu học",
  ],
  alternates: { canonical: "/math" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/math" },
};

export default function MathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
