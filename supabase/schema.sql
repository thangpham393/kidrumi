-- Kidrumi — lược đồ CSDL cho trang Nhiệm vụ
-- Chạy MỘT LẦN trong Supabase: Dashboard > SQL Editor > New query > dán & Run.
-- An toàn khi chạy lại (dùng "if not exists" / "drop policy if exists").

-- 1) Hồ sơ bé — mỗi tài khoản ba mẹ có thể có nhiều bé.
create table if not exists public.children (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  world      text not null default 'carrot',
  stars      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists children_user_id_idx on public.children (user_id);

-- 2) Nhiệm vụ của bé — sao (stars) chính là độ khó (1..3).
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references public.children (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  icon       text not null default '🌟',
  category   text,
  stars      integer not null default 1 check (stars between 1 and 3),
  sort       integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tasks_child_id_idx on public.tasks (child_id);

-- 3) Lịch sử hoàn thành theo ngày — mỗi nhiệm vụ tick 1 lần / ngày.
create table if not exists public.task_completions (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks (id) on delete cascade,
  child_id   uuid not null references public.children (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  done_on    date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  unique (task_id, done_on)
);

create index if not exists task_completions_child_day_idx
  on public.task_completions (child_id, done_on);

-- 4) Tiến độ Shadowing — mỗi bé, mỗi video giữ danh sách câu ĐÃ nghe.
--    heard = mảng chỉ số câu (0-based) trong transcript; total = tổng câu lúc lưu.
--    updated_at để sắp xếp tab "Đang học" (mới học lên đầu). Chỉ lưu khi đăng nhập.
create table if not exists public.shadowing_progress (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references public.children (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  video_id   text not null,
  lang       text not null default 'en',
  heard      integer[] not null default '{}',
  total      integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (child_id, video_id)
);

create index if not exists shadowing_progress_child_idx
  on public.shadowing_progress (child_id, updated_at desc);

-- Tiến độ "Nghe & chọn" (lộ trình): mảng id các chặng ĐÃ hoàn thành, theo bé + ngôn ngữ.
-- Một dòng cho mỗi (child_id, lang); dùng để mở khoá chặng đồng bộ giữa các thiết bị.
create table if not exists public.listen_progress (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references public.children (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  lang       text not null,
  done       text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (child_id, lang)
);

create index if not exists listen_progress_child_idx
  on public.listen_progress (child_id, updated_at desc);

-- 5) Row Level Security — mỗi ba mẹ chỉ thấy & sửa dữ liệu của chính mình.
alter table public.children          enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_completions  enable row level security;
alter table public.shadowing_progress enable row level security;
alter table public.listen_progress    enable row level security;

drop policy if exists children_own on public.children;
create policy children_own on public.children
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists tasks_own on public.tasks;
create policy tasks_own on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists task_completions_own on public.task_completions;
create policy task_completions_own on public.task_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists shadowing_progress_own on public.shadowing_progress;
create policy shadowing_progress_own on public.shadowing_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists listen_progress_own on public.listen_progress;
create policy listen_progress_own on public.listen_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
