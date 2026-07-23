import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./admin.css";
import AdminShell from "@/components/admin/layout/AdminShell";
import AdminGate from "@/components/admin/layout/AdminGate";
import { requireAdmin } from "@/lib/admin/auth";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kidrumi Admin",
  // Toàn bộ khu quản trị không cho công cụ tìm kiếm lập chỉ mục.
  robots: { index: false, follow: false },
};

// No-flash: set the resolved theme on .admin-root before the subtree paints.
const themeInit = `(function(){try{var t=localStorage.getItem('kidrumi-admin-theme');var el=document.currentScript&&document.currentScript.parentElement;if(t&&el)el.setAttribute('data-admin-theme',t);}catch(e){}})();`;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cổng bảo vệ toàn bộ /admin: chỉ email trong ADMIN_EMAILS mới vào được.
  const gate = await requireAdmin();

  return (
    <div className={`admin-root ${beVietnam.variable}`} suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      {gate.ok ? <AdminShell>{children}</AdminShell> : <AdminGate gate={gate} />}
    </div>
  );
}
