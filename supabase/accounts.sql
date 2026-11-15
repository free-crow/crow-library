-- 乌鸦的图书馆 V1.2 · 账号与验证码表（在 Supabase → SQL Editor 里整段执行）
-- 说明：账号是“邮箱 + 加盐哈希密码”，不保存明文密码；验证码 10 分钟有效。

create table if not exists public.crow_accounts (
  email      text primary key,
  nick       text not null,
  salt       text not null,
  hash       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crow_codes (
  email        text primary key,
  code         text not null,
  expires_at   timestamptz not null,
  last_sent_at timestamptz not null
);

alter table public.crow_accounts enable row level security;
alter table public.crow_codes    enable row level security;

-- 服务端接口使用 anon key 时需要的策略（若已配置 SUPABASE_SERVICE_ROLE_KEY 可跳过）
drop policy if exists crow_accounts_select on public.crow_accounts;
drop policy if exists crow_accounts_insert on public.crow_accounts;
drop policy if exists crow_codes_all      on public.crow_codes;

create policy crow_accounts_select on public.crow_accounts for select using (true);
create policy crow_accounts_insert on public.crow_accounts for insert with check (true);
create policy crow_codes_all      on public.crow_codes    for all    using (true) with check (true);
