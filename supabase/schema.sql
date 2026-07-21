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

-- 4) Row Level Security — mỗi ba mẹ chỉ thấy & sửa dữ liệu của chính mình.
alter table public.children         enable row level security;
alter table public.tasks            enable row level security;
alter table public.task_completions enable row level security;

drop policy if exists children_own on public.children;
create policy children_own on public.children
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists tasks_own on public.tasks;
create policy tasks_own on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists task_completions_own on public.task_completions;
create policy task_completions_own on public.task_completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
