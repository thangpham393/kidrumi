"use client";

import Link from "next/link";
import { Clapperboard, ListMusic, Library, Languages, ArrowRight } from "lucide-react";
import { PageHeader, StatCard, Panel, Badge, DataTable, type Column } from "@/components/admin";
import type { LibraryStats, SlimVideo, Count } from "@/lib/admin/library";
import styles from "./dashboard.module.css";

const LEVEL_LABEL: Record<string, string> = {
  l1: "Cấp 1", l2: "Cấp 2", de: "Dễ", mid: "Trung bình", hard: "Khó",
  kelly: "Kelly's Class", ft1: "Folktales 1", ft2: "Folktales 2",
};
const LANG_LABEL: Record<string, string> = { zh: "Tiếng Trung", en: "Tiếng Anh" };

function Bars({ data, labelMap }: { data: Count[]; labelMap?: Record<string, string> }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className={styles.bars}>
      {data.map((d) => (
        <div key={d.key} className={styles.barRow}>
          <span className={styles.barLabel}>{labelMap?.[d.key] ?? d.key}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(d.count / max) * 100}%` }} />
          </span>
          <span className={`${styles.barVal} admin-num`}>{d.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardView({
  stats,
  recent,
}: {
  stats: LibraryStats;
  recent: SlimVideo[];
}) {
  const zh = stats.byLang.find((l) => l.key === "zh")?.count ?? 0;
  const en = stats.byLang.find((l) => l.key === "en")?.count ?? 0;

  const cols: Column<SlimVideo>[] = [
    {
      key: "title",
      header: "Video",
      render: (v) => (
        <div className={styles.vid}>
          <span className={styles.vidEmoji} aria-hidden="true">{v.emoji || "🎬"}</span>
          <span className={styles.vidTitle}>{v.title}</span>
        </div>
      ),
    },
    { key: "source", header: "Nguồn", render: (v) => <Badge tone="neutral">{v.source}</Badge> },
    {
      key: "lang",
      header: "Ngôn ngữ",
      render: (v) => <Badge tone={v.lang === "zh" ? "primary" : "info"}>{LANG_LABEL[v.lang] ?? v.lang}</Badge>,
    },
    { key: "count", header: "Số câu", align: "right", render: (v) => <span className="admin-num">{v.count}</span> },
    { key: "dur", header: "Thời lượng", align: "right", render: (v) => <span className="admin-num">{v.dur}</span> },
  ];

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Tổng quan"
        description="Thống kê thật từ thư viện nội dung Shadowing."
        actions={
          <Link href="/admin/shadowing" className={styles.headAction}>
            Quản lý Shadowing <ArrowRight size={16} />
          </Link>
        }
      />

      <div className={styles.statGrid}>
        <StatCard label="Tổng số video" value={stats.total.toLocaleString("vi-VN")} icon={Clapperboard} />
        <StatCard label="Tổng số câu" value={stats.totalSegments.toLocaleString("vi-VN")} icon={ListMusic} />
        <StatCard label="Nguồn nội dung" value={stats.bySource.length} icon={Library} />
        <StatCard label="Ngôn ngữ" value={stats.byLang.length} icon={Languages} hint={`${zh} zh · ${en} en`} />
      </div>

      <div className={styles.split}>
        <Panel title="Video theo nguồn" subtitle={`${stats.bySource.length} nguồn`}>
          <Bars data={stats.bySource} />
        </Panel>
        <Panel title="Theo cấp độ" subtitle="Phân bố độ khó">
          <Bars data={stats.byLevel} labelMap={LEVEL_LABEL} />
        </Panel>
      </div>

      <Panel title="Video mới nhất" subtitle="8 video thêm gần đây" bodyClassName="admin-panel-flush">
        <DataTable columns={cols} rows={recent} getRowId={(v) => v.id} emptyLabel="Thư viện trống." />
      </Panel>
    </div>
  );
}
