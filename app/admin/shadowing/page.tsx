"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import {
  PageHeader,
  Panel,
  Button,
  Badge,
  Input,
  DataTable,
  TableToolbar,
  Pagination,
  Modal,
  EmptyState,
  useToast,
  type Column,
} from "@/components/admin";
import styles from "./shadowing.module.css";

type VideoRow = {
  id: string;
  title: string;
  lang: "en" | "zh";
  source: string;
  level: string;
  dur: string;
  emoji: string;
  youtubeId: string;
  count: number;
};

const LEVEL_LABEL: Record<string, string> = {
  l1: "Cấp 1", l2: "Cấp 2", de: "Dễ", mid: "Trung bình", hard: "Khó",
  kelly: "Kelly's Class", ft1: "Folktales 1", ft2: "Folktales 2",
};
const LANG_LABEL: Record<string, string> = { zh: "Tiếng Trung", en: "Tiếng Anh" };
const PAGE_SIZE = 10;
const LANGS = [
  { key: "", label: "Tự động" },
  { key: "en", label: "Tiếng Anh" },
  { key: "zh", label: "Tiếng Trung" },
] as const;

export default function AdminShadowingPage() {
  const toast = useToast();
  const [list, setList] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [lang, setLang] = useState<"" | "en" | "zh">("");
  const [importing, setImporting] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<VideoRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setBlockedMsg(null);
    try {
      const r = await fetch("/api/admin/shadowing");
      const d = await r.json();
      if (!r.ok || d.error) setBlockedMsg(d.error || "Không tải được danh sách.");
      else setList(d.videos ?? []);
    } catch {
      setBlockedMsg("Không gọi được máy chủ. Kiểm tra server có đang chạy không.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitImport = async () => {
    if (!url.trim() || importing) return;
    setImporting(true);
    try {
      const r = await fetch("/api/admin/shadowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, lang: lang || undefined }),
      });
      const d = await r.json();
      if (!r.ok || d.error) {
        toast({ tone: "danger", title: "Nhập thất bại", description: d.error || "Có lỗi xảy ra." });
      } else {
        setList(d.videos ?? []);
        setUrl("");
        toast({
          tone: "success",
          title: d.updated ? "Đã cập nhật video" : "Đã thêm video",
          description: `${d.video?.title ?? ""} · ${d.video?.count ?? 0} câu`,
        });
      }
    } catch {
      toast({ tone: "danger", title: "Lỗi máy chủ", description: "Không gọi được API nhập video." });
    } finally {
      setImporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/admin/shadowing?id=${encodeURIComponent(target.id)}`, { method: "DELETE" });
      const d = await r.json();
      if (d.videos) setList(d.videos);
      toast({ tone: "success", title: "Đã xoá", description: target.title });
    } catch {
      toast({ tone: "danger", title: "Không xoá được" });
    } finally {
      setDeleting(false);
      setTarget(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (v) => v.title.toLowerCase().includes(q) || v.source.toLowerCase().includes(q),
    );
  }, [list, query]);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cols: Column<VideoRow>[] = [
    {
      key: "title",
      header: "Video",
      render: (v) => (
        <div className={styles.vid}>
          <span className={styles.emoji} aria-hidden="true">{v.emoji || "🎬"}</span>
          <div className={styles.vidMeta}>
            <span className={styles.vidTitle}>{v.title}</span>
            <a
              className={styles.ytLink}
              href={`https://youtu.be/${v.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {v.youtubeId}
            </a>
          </div>
        </div>
      ),
    },
    { key: "source", header: "Nguồn", render: (v) => <Badge tone="neutral">{v.source}</Badge> },
    { key: "lang", header: "Ngôn ngữ", render: (v) => <Badge tone={v.lang === "zh" ? "primary" : "info"}>{LANG_LABEL[v.lang] ?? v.lang}</Badge> },
    { key: "level", header: "Cấp độ", render: (v) => <Badge tone="warning">{LEVEL_LABEL[v.level] ?? v.level}</Badge> },
    { key: "count", header: "Số câu", align: "right", render: (v) => <span className="admin-num">{v.count}</span> },
    { key: "dur", header: "Thời lượng", align: "right", render: (v) => <span className="admin-num">{v.dur}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (v) => (
        <Button
          size="sm"
          variant="ghost"
          leadingIcon={Trash2}
          aria-label={`Xoá ${v.title}`}
          onClick={() => setTarget(v)}
        >
          Xoá
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Nội dung Shadowing"
        description="Thư viện video luyện nghe-nói. Nhập từ YouTube, xem và xoá — dữ liệu thật."
        actions={
          <Button variant="secondary" leadingIcon={RefreshCw} onClick={load} isLoading={loading}>
            Tải lại
          </Button>
        }
      />

      {blockedMsg ? (
        <Panel title="Công cụ nội bộ">
          <EmptyState
            emoji="🛠️"
            title="Chỉ dùng khi chạy máy cục bộ"
            description={blockedMsg}
          />
        </Panel>
      ) : (
        <>
          {/* Import — chức năng THẬT (/api/admin/shadowing POST) */}
          <Panel title="Nhập video từ YouTube" subtitle="Dán link, chọn ngôn ngữ (hoặc để tự động)">
            <div className={styles.importForm}>
              <Input
                label="Link YouTube"
                placeholder="https://youtu.be/…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitImport()}
                className={styles.urlField}
              />
              <div className={styles.langField}>
                <span className={styles.langLabel}>Ngôn ngữ</span>
                <div className={styles.langRow}>
                  {LANGS.map((l) => (
                    <Button
                      key={l.key}
                      size="sm"
                      variant={lang === l.key ? "primary" : "secondary"}
                      onClick={() => setLang(l.key)}
                    >
                      {l.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button leadingIcon={Plus} onClick={submitImport} isLoading={importing} disabled={!url.trim()}>
                Nhập
              </Button>
            </div>
          </Panel>

          <Panel
            title="Thư viện"
            subtitle={`${filtered.length} video`}
            bodyClassName="admin-panel-flush"
          >
            <TableToolbar
              searchValue={query}
              onSearchChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              searchPlaceholder="Tìm theo tên hoặc nguồn…"
            >
              <a className={styles.toolbarLink} href="/shadowing" target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Xem trang học
              </a>
            </TableToolbar>
            <DataTable
              columns={cols}
              rows={paged}
              getRowId={(v) => v.id}
              loading={loading}
              emptyState={
                <EmptyState
                  emoji="🔍"
                  title={query ? "Không tìm thấy" : "Thư viện trống"}
                  description={query ? "Thử từ khoá khác." : "Nhập video đầu tiên từ YouTube ở trên."}
                />
              }
            />
            {filtered.length > PAGE_SIZE && (
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            )}
          </Panel>
        </>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Xoá video?"
        description={target ? `“${target.title}” sẽ bị gỡ khỏi thư viện.` : ""}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>Huỷ</Button>
            <Button variant="danger" leadingIcon={Trash2} onClick={confirmDelete} isLoading={deleting}>
              Xoá
            </Button>
          </>
        }
      />
    </div>
  );
}
