import {
  LayoutDashboard,
  Clapperboard,
  Users,
  Component,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string; // tiếng Việt, ngắn
  icon: LucideIcon;
  badge?: string | number;
};

export type NavGroup = {
  title?: string;
  defaultOpen?: boolean;
  items: NavItem[];
};

// CHỈ những gì thực sự có backend/dữ liệu thật.
// - Tổng quan: thống kê thật từ thư viện Shadowing.
// - Shadowing: công cụ quản lý nội dung thật (/api/admin/shadowing).
// - Thư viện UI: trang tham chiếu các thành phần (dev).
export const NAV: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Tổng quan", icon: LayoutDashboard }],
  },
  {
    title: "Nội dung",
    items: [{ href: "/admin/shadowing", label: "Shadowing", icon: Clapperboard }],
  },
  {
    title: "Quản lý",
    items: [{ href: "/admin/users", label: "Người dùng", icon: Users }],
  },
  {
    title: "Hệ thống",
    items: [{ href: "/admin/ui", label: "Thư viện UI", icon: Component }],
  },
];

export const NAV_FLAT: NavItem[] = NAV.flatMap((g) => g.items);
