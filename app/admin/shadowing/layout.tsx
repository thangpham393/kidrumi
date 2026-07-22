import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị Shadowing",
  // Trang quản trị nội bộ — không cho Google index.
  robots: { index: false, follow: false },
};

export default function AdminShadowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
