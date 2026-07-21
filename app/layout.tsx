import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import SceneBackground from "@/components/SceneBackground";
import { ChildProvider } from "@/components/ChildContext";
import { AuthProvider } from "@/components/AuthContext";

const baloo = Baloo_2({
  subsets: ["latin", "vietnamese"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kidrumi — Không gian học vui của bé",
  description:
    "Kidrumi: nhiệm vụ mỗi ngày, shadowing tiếng Anh, học toán và tập gõ phím cho bé tuổi tiền tiểu học.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        <SceneBackground />
        <AuthProvider>
          <ChildProvider>
            <TopNav />
            {children}
          </ChildProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
