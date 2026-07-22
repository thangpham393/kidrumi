import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào Kidrumi để lưu ngôi sao và tiến trình học của bé.",
  // Trang tiện ích — không cần Google index.
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
