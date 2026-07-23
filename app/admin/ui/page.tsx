"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Filter,
  ArrowUpDown,
  Download,
  Command as CommandIcon,
  PanelRight,
  SquareStack,
} from "lucide-react";
import {
  PageHeader,
  Panel,
  Button,
  Badge,
  Input,
  Switch,
  StatCard,
  Card,
  DataTable,
  TableToolbar,
  Pagination,
  Modal,
  Drawer,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonCard,
  Kbd,
  useToast,
  useCommandPalette,
  type Column,
} from "@/components/admin";
import styles from "./kitchen.module.css";

type Row = { id: string; name: string; role: string; active: boolean };
const ALL_ROWS: Row[] = [
  { id: "1", name: "Nguyễn An", role: "Giáo viên", active: true },
  { id: "2", name: "Trần Bình", role: "Phụ huynh", active: false },
  { id: "3", name: "Lê Chi", role: "Giáo viên", active: true },
  { id: "4", name: "Phạm Dũng", role: "Quản trị", active: true },
  { id: "5", name: "Vũ Em", role: "Phụ huynh", active: false },
];
const PAGE_SIZE = 3;

export default function KitchenSinkPage() {
  const toast = useToast();
  const { setOpen: setCmdOpen } = useCommandPalette();

  const [notify, setNotify] = useState(true);
  const [experimental, setExperimental] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => ALL_ROWS.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) => (s.size === paged.length ? new Set() : new Set(paged.map((r) => r.id))));

  const cols: Column<Row>[] = [
    { key: "name", header: "Tên", render: (r) => <b>{r.name}</b> },
    { key: "role", header: "Vai trò", render: (r) => r.role },
    {
      key: "active",
      header: "Trạng thái",
      align: "right",
      render: (r) => (
        <Badge tone={r.active ? "success" : "neutral"} dot>
          {r.active ? "Hoạt động" : "Ngưng"}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Thư viện giao diện"
        description="Toàn bộ thành phần của shell — thử ở cả giao diện sáng và tối (nút 🌙 trên thanh trên)."
        breadcrumbs
        actions={
          <Button variant="secondary" leadingIcon={CommandIcon} onClick={() => setCmdOpen(true)}>
            Mở Command Palette
          </Button>
        }
      />

      {/* Overlays */}
      <Panel title="Lớp phủ (Overlay)" subtitle="Modal · Drawer · Toast · Command Palette">
        <div className={styles.row}>
          <Button leadingIcon={SquareStack} onClick={() => setModalOpen(true)}>Mở Modal</Button>
          <Button variant="secondary" leadingIcon={PanelRight} onClick={() => setDrawerOpen(true)}>
            Mở Drawer
          </Button>
          <Button variant="secondary" leadingIcon={CommandIcon} onClick={() => setCmdOpen(true)}>
            Command Palette <Kbd>⌘</Kbd><Kbd>K</Kbd>
          </Button>
          <Button variant="subtle" onClick={() => toast({ tone: "success", title: "Đã lưu!", description: "Thay đổi của bạn đã được ghi lại." })}>
            Toast thành công
          </Button>
          <Button variant="subtle" onClick={() => toast({ tone: "danger", title: "Không xoá được", description: "Bản ghi đang được sử dụng." })}>
            Toast lỗi
          </Button>
        </div>
      </Panel>

      {/* Table system */}
      <Panel title="Hệ thống bảng" subtitle="Toolbar · chọn nhiều · phân trang · loading" bodyClassName="admin-panel-flush">
        <TableToolbar
          searchValue={query}
          onSearchChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          searchPlaceholder="Tìm theo tên…"
          selectedCount={selected.size}
          onClearSelection={() => setSelected(new Set())}
          bulkActions={
            <>
              <Button size="sm" variant="ghost" leadingIcon={Download}>Xuất</Button>
              <Button size="sm" variant="danger" leadingIcon={Trash2}
                onClick={() => { toast({ tone: "danger", title: `Đã xoá ${selected.size} mục` }); setSelected(new Set()); }}>
                Xoá
              </Button>
            </>
          }
        >
          <Button size="sm" variant="secondary" leadingIcon={Filter}>Lọc</Button>
          <Button size="sm" variant="secondary" leadingIcon={ArrowUpDown}>Sắp xếp</Button>
          <Button size="sm" variant="secondary" leadingIcon={Download}>Xuất</Button>
          <Button size="sm" leadingIcon={Plus}>Thêm</Button>
        </TableToolbar>
        <DataTable
          columns={cols}
          rows={paged}
          getRowId={(r) => r.id}
          loading={loading}
          selection={{
            selectedIds: selected,
            onToggle: toggle,
            onToggleAll: toggleAll,
            allChecked: paged.length > 0 && paged.every((r) => selected.has(r.id)),
          }}
          emptyState={
            <EmptyState
              emoji="🔍"
              title="Không tìm thấy"
              description="Thử từ khoá khác hoặc xoá bộ lọc."
              action={<Button variant="secondary" onClick={() => setQuery("")}>Xoá tìm kiếm</Button>}
            />
          }
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </Panel>

      <Panel title="Trạng thái tải & rỗng">
        <div className={styles.stack}>
          <Switch checked={loading} onChange={setLoading} label="Bật loading cho bảng ở trên" />
          <div className={styles.statGrid}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320 }}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="90%" />
            <Skeleton height={12} width="55%" />
          </div>
        </div>
      </Panel>

      <div className={styles.split2}>
        <Card padding="none">
          <EmptyState
            title="Chưa có học sinh"
            description="Thêm học sinh đầu tiên để bắt đầu theo dõi tiến độ."
            action={<Button leadingIcon={Plus}>Thêm học sinh</Button>}
            secondaryAction={<Button variant="ghost">Nhập từ file</Button>}
          />
        </Card>
        <Card padding="none">
          <ErrorState onRetry={() => toast({ tone: "info", title: "Đang thử lại…" })} />
        </Card>
      </div>

      {/* Base primitives (Phase 1) */}
      <Panel title="Nút (Button)">
        <div className={styles.stack}>
          <div className={styles.row}>
            <Button variant="primary">Chính</Button>
            <Button variant="secondary">Phụ</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Nhẹ</Button>
            <Button variant="danger" leadingIcon={Trash2}>Xoá</Button>
            <Button isLoading>Đang tải</Button>
            <Button disabled>Vô hiệu</Button>
          </div>
        </div>
      </Panel>

      <Panel title="Nhãn & Ô nhập">
        <div className={styles.row} style={{ marginBottom: 16 }}>
          <Badge tone="primary" dot>Chủ đạo</Badge>
          <Badge tone="success" dot>Thành công</Badge>
          <Badge tone="warning" dot>Cảnh báo</Badge>
          <Badge tone="danger" dot>Nguy hiểm</Badge>
          <Badge tone="info" dot>Thông tin</Badge>
        </div>
        <div className={styles.col}>
          <Input label="Họ và tên" placeholder="Nhập họ tên…" />
          <Input label="Mã lớp" defaultValue="2A-#" error="Mã lớp không hợp lệ." />
          <div className={styles.row}>
            <Switch checked={notify} onChange={setNotify} label="Bật thông báo" />
            <Switch checked={experimental} onChange={setExperimental} label="Thử nghiệm" />
          </div>
        </div>
      </Panel>

      <Panel title="Thẻ số liệu">
        <div className={styles.statGrid}>
          <StatCard label="Học sinh" value="1.284" delta={12.4} hint="tuần này" />
          <StatCard label="Giờ học" value="512h" delta={-3.2} hint="tuần này" />
        </div>
      </Panel>

      {/* Modal + Drawer instances */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Xác nhận hành động"
        description="Đây là modal mẫu với hiệu ứng scale + fade và nền mờ."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Huỷ</Button>
            <Button onClick={() => { setModalOpen(false); toast({ tone: "success", title: "Đã xác nhận" }); }}>
              Xác nhận
            </Button>
          </>
        }
      >
        <p style={{ color: "var(--c-text-secondary)", lineHeight: 1.6 }}>
          Nội dung modal đặt ở đây. Bo góc lớn, bóng mềm, đóng bằng Esc hoặc bấm ra ngoài.
        </p>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Chi tiết (mẫu)"
        description="Slide-over 480px — dùng cho chi tiết học sinh / khoá học / video."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Đóng</Button>
            <Button onClick={() => setDrawerOpen(false)}>Lưu</Button>
          </>
        }
      >
        <div className={styles.col}>
          <Input label="Tên" defaultValue="Minh An" />
          <Input label="Lớp" defaultValue="Lớp 1" />
          <p style={{ color: "var(--c-text-secondary)", lineHeight: 1.6 }}>
            Panel trượt từ phải, khoá cuộn nền, đóng bằng Esc / bấm nền mờ.
          </p>
        </div>
      </Drawer>
    </div>
  );
}
