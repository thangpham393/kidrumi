import type { Metadata } from "next";

const title = "Phiếu bài tập — Cộng trừ nhân chia";
const description =
  "Phiếu bài tập toán cho bé tiền tiểu học: ba mẹ chọn phép tính cộng, trừ, nhân, chia và độ khó, bé điền kết quả rồi được chấm điểm ngay.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "phiếu bài tập toán",
    "toán cộng trừ nhân chia",
    "học toán cho bé",
    "toán tiền tiểu học",
  ],
  alternates: { canonical: "/math/worksheet" },
  openGraph: { title: `${title} — Kidrumi`, description, url: "/math/worksheet" },
};

export default function WorksheetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
