import { getLibrary } from "@/lib/admin/library";
import DashboardView from "@/components/admin/dashboard/DashboardView";

// Đọc thư viện thật mỗi lần tải để phản ánh video vừa nhập/xoá.
export const dynamic = "force-dynamic";

// Server Component: đọc dữ liệu THẬT (3.8MB JSON) phía server,
// chỉ truyền phần rút gọn xuống client.
export default function AdminDashboardPage() {
  const { stats, videos } = getLibrary();
  const recent = [...videos].slice(-8).reverse();
  return <DashboardView stats={stats} recent={recent} />;
}
