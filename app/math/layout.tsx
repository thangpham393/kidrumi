import type { Metadata } from "next";

const title = "Học toán — Cộng trừ nhân chia";
const description =
  "Phiếu bài tập toán cho bé tiền tiểu học: ba mẹ chọn phép tính cộng, trừ, nhân, chia và độ khó, bé điền kết quả rồi được chấm điểm ngay.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "học toán cho bé",
    "toán cộng trừ nhân chia",
    "phiếu bài tập toán",
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
