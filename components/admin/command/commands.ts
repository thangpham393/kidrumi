import { Upload, Moon, PlaySquare, type LucideIcon } from "lucide-react";
import { Clapperboard } from "lucide-react";
import { NAV_FLAT } from "../layout/nav";
import type { SlimVideo } from "@/lib/admin/library";

export type CommandKind = "page" | "video" | "action";

export type Command = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  kind: CommandKind;
  href?: string;
  external?: boolean;
  action?: "theme";
};

export const GROUP_LABEL: Record<CommandKind, string> = {
  page: "Trang",
  video: "Video Shadowing",
  action: "Hành động",
};

const PAGES: Command[] = NAV_FLAT.map((i) => ({
  id: `p-${i.href}`,
  label: i.label,
  hint: i.href,
  icon: i.icon,
  kind: "page",
  href: i.href,
}));

export const ACTIONS: Command[] = [
  { id: "a-import", label: "Nhập video Shadowing", icon: Upload, kind: "action", href: "/admin/shadowing" },
  { id: "a-view", label: "Mở trang học Shadowing", icon: PlaySquare, kind: "action", href: "/shadowing", external: true },
  { id: "a-theme", label: "Đổi giao diện sáng/tối", icon: Moon, kind: "action", action: "theme" },
];

function videoToCommand(v: SlimVideo): Command {
  return {
    id: `v-${v.id}`,
    label: v.title,
    hint: `${v.source} · ${v.dur}`,
    icon: Clapperboard,
    kind: "video",
    href: "/admin/shadowing",
  };
}

/** query rỗng → gợi ý mặc định (trang + hành động). Có query → thêm video thật. */
export function filterCommands(query: string, videos: SlimVideo[]): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PAGES, ...ACTIONS];

  const pages = PAGES.filter((c) => c.label.toLowerCase().includes(q));
  const actions = ACTIONS.filter((c) => c.label.toLowerCase().includes(q));
  const vids = videos
    .filter((v) => v.title.toLowerCase().includes(q) || v.source.toLowerCase().includes(q))
    .slice(0, 8)
    .map(videoToCommand);
  return [...pages, ...vids, ...actions];
}
