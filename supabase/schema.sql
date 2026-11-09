-- =============================================================
-- Crow Library 乌鸦的图书馆 · 数据库初始化文件（PostgreSQL / Supabase）
-- 对应《项目规划》第十章数据库规划 与《版权合规计划》第六章版权字段
-- 原则：只有 copyright_status = 'approved' 的书才会向公众开放（RLS 强制）
-- =============================================================

create extension if not exists "uuid-ossp";
-- create extension if not exists vector;  -- 第 7 阶段 RAG 启用

-- ---------- 用户 ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nick text not null default '乌鸦读者',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists user_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  site_theme text not null default 'light' check (site_theme in ('light','dark','system','custom')),
  accent_color text not null default '#3b5bfd',
  -- 网站主题与阅读器主题分别保存
  reader_font_size int not null default 17,
  reader_font text not null default 'serif',
  reader_bg text not null default 'paper'
);

-- ---------- 书籍 ----------
create table if not exists authors (
  id bigint generated always as identity primary key,
  name text not null,
  intro text
);

create table if not exists categories (          -- 可扩展的多级分类
  id bigint generated always as identity primary key,
  parent_id bigint references categories(id) on delete set null,
  name text not null,
  sort int not null default 0
);

create table if not exists tags (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists books (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author_id bigint references authors(id),
  translator text,
  intro text,
  original_language text default '中文',
  cover_key text,                                 -- 受控存储中的封面
  -- ===== 版权字段（《版权合规计划》第六章） =====
  copyright_status text not null default 'pending'
    check (copyright_status in ('public_domain','open_license','direct_permission','link_only','pending','disputed','rejected')),
  review_state text not null default 'pending'    -- 审核状态：只有 approved 公开
    check (review_state in ('pending','approved','disputed','suspended','removed')),
  rights_holder text,
  license_name text,
  license_url text,
  permission_scope text[],                        -- 在线阅读/下载/转换/AI 索引/AI 问答…
  territory text,
  valid_until date,
  attribution_text text,
  source_url text,
  source_date date,
  evidence_storage_key text,                      -- 授权证据的受控存储位置
  reviewer text,
  reviewed_at timestamptz,
  content_hash text,                              -- 文件校验、版本追踪
  version int not null default 1,
  ai_allowed boolean not null default false,      -- 授权是否覆盖 AI 处理
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists book_categories (
  book_id uuid references books(id) on delete cascade,
  category_id bigint references categories(id) on delete cascade,
  primary key (book_id, category_id)
);

create table if not exists book_tags (
  book_id uuid references books(id) on delete cascade,
  tag_id bigint references tags(id) on delete cascade,
  primary key (book_id, tag_id)
);

create table if not exists chapters (
  id bigint generated always as identity primary key,
  book_id uuid not null references books(id) on delete cascade,
  idx int not null,
  title text not null,
  unique (book_id, idx)
);

create table if not exists book_files (
  id bigint generated always as identity primary key,
  book_id uuid not null references books(id) on delete cascade,
  format text not null check (format in ('EPUB','PDF','TXT')),
  storage_key text not null,                      -- 受控存储路径（不公开）
  content_hash text,
  size_bytes bigint
);

-- ---------- 版权 ----------
create table if not exists copyright_records (    -- 审核留痕
  id bigint generated always as identity primary key,
  book_id uuid not null references books(id) on delete cascade,
  action text not null,                           -- submit/approve/dispute/suspend/remove/review
  reviewer text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists copyright_complaints ( -- 投诉与下架响应
  id bigint generated always as identity primary key,
  book_id uuid not null references books(id) on delete cascade,
  complainant text not null,                      -- 投诉人（不公开个人信息）
  contact text,
  basis text,                                     -- 权利依据
  status text not null default 'open' check (status in ('open','risk_controlled','resolved','rejected')),
  takedown_at timestamptz,
  handled_by text,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- 阅读记忆（用户数据按账号隔离） ----------
create table if not exists reading_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  chapter_idx int not null default 0,
  percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table if not exists reading_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  chapter_idx int not null default 0,
  percent numeric(5,2) not null default 0,
  read_at timestamptz not null default now()
);

create table if not exists bookmarks (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  chapter_idx int not null,
  excerpt text,
  created_at timestamptz not null default now()
);

-- ---------- 个人书架 ----------
create table if not exists user_collections (     -- 收藏
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create table if not exists reading_lists (        -- 书单
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists reading_list_items (
  list_id uuid references reading_lists(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  primary key (list_id, book_id)
);

create table if not exists reading_plans (
  user_id uuid primary key references profiles(id) on delete cascade,
  daily_minutes int not null default 30,
  monthly_books int not null default 10
);

-- ---------- AI（仅对 ai_allowed 的书建立索引；额度控制） ----------
create table if not exists ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  book_id uuid references books(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists ai_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists book_chunks (          -- RAG 索引（第 7 阶段 + pgvector）
  id bigint generated always as identity primary key,
  book_id uuid not null references books(id) on delete cascade,
  chapter_idx int,
  content text not null
  -- embedding vector(1536)
);

create table if not exists ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  tokens int not null default 0,
  cost numeric(10,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists ai_user_limits (
  user_id uuid primary key references profiles(id) on delete cascade,
  daily_quota int not null default 50
);

-- ---------- 管理 ----------
create table if not exists admin_roles (
  user_id uuid primary key references profiles(id) on delete cascade,
  role text not null check (role in ('admin','reviewer'))  -- 公开发布须 reviewer，权限分离
);

create table if not exists reports (
  id bigint generated always as identity primary key,
  reporter uuid references profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ---------- 行级安全：用户数据隔离 + 仅公开审核通过的书 ----------
alter table profiles enable row level security;
alter table user_settings enable row level security;
alter table books enable row level security;
alter table reading_progress enable row level security;
alter table reading_history enable row level security;
alter table bookmarks enable row level security;
alter table user_collections enable row level security;
alter table reading_lists enable row level security;
alter table reading_list_items enable row level security;
alter table reading_plans enable row level security;

create policy "public read approved books" on books
  for select using (review_state = 'approved');   -- 只有审核通过的书向公众开放
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own settings" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress" on reading_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own history" on reading_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own bookmarks" on bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own collections" on user_collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own lists" on reading_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own list items" on reading_list_items
  for all using (exists (select 1 from reading_lists l where l.id = list_id and l.user_id = auth.uid()));
create policy "own plan" on reading_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 后续（漫画馆上线时再建） ----------
-- create table comics (...);
-- create table comic_chapters (...);
-- create table comic_pages (...);
