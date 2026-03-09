-- Nexo | Presença em tempo quase real para o painel Admin
-- Rode este arquivo inteiro no Supabase SQL Editor.

alter table public.profiles
  add column if not exists is_admin boolean default false;

alter table public.profiles
  add column if not exists role text default 'user';

alter table public.profiles
  add column if not exists last_login timestamptz;

alter table public.profiles
  add column if not exists last_seen timestamptz;

create table if not exists public.user_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_online boolean not null default false,
  last_seen timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '45 seconds'),
  updated_at timestamptz not null default now()
);

alter table public.user_presence
  add column if not exists is_online boolean not null default false;

alter table public.user_presence
  add column if not exists last_seen timestamptz not null default now();

alter table public.user_presence
  add column if not exists expires_at timestamptz not null default (now() + interval '45 seconds');

alter table public.user_presence
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_presence enable row level security;

create or replace function public.sync_profiles_from_auth()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  affected_count integer := 0;
begin
  insert into public.profiles (
    id,
    email,
    created_at,
    last_login,
    last_seen,
    preferred_currency,
    role,
    is_admin
  )
  select
    au.id,
    coalesce(au.email, ''),
    coalesce(au.created_at, now()),
    au.last_sign_in_at,
    coalesce(au.last_sign_in_at, au.created_at, now()),
    'BRL',
    'user',
    false
  from auth.users au
  left join public.profiles p on p.id = au.id
  where p.id is null;

  get diagnostics affected_count = row_count;

  update public.profiles p
  set
    email = coalesce(au.email, p.email),
    created_at = coalesce(p.created_at, au.created_at, p.created_at),
    last_login = coalesce(au.last_sign_in_at, p.last_login),
    last_seen = coalesce(p.last_seen, au.last_sign_in_at, p.created_at, now())
  from auth.users au
  where au.id = p.id;

  return affected_count;
end;
$$;

select public.sync_profiles_from_auth();

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_presence'
      and policyname = 'user_presence_select_own'
  ) then
    create policy user_presence_select_own
    on public.user_presence
    for select
    to authenticated
    using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_presence'
      and policyname = 'user_presence_insert_own'
  ) then
    create policy user_presence_insert_own
    on public.user_presence
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_presence'
      and policyname = 'user_presence_update_own'
  ) then
    create policy user_presence_update_own
    on public.user_presence
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.admin_dashboard_metrics()
returns json
language sql
security definer
set search_path = public, auth
as $$
  with totals as (
    select count(*)::int as total_users
    from auth.users
  ),
  online as (
    select count(*)::int as online_users
    from public.user_presence up
    where up.is_online = true
      and up.last_seen > now() - interval '45 seconds'
      and up.expires_at > now()
  )
  select json_build_object(
    'total_users', totals.total_users,
    'online_users', online.online_users,
    'offline_users', greatest(totals.total_users - online.online_users, 0)
  )
  from totals, online;
$$;

create or replace function public.admin_recent_users(limit_count integer default 10)
returns table (
  id uuid,
  email text,
  created_at timestamptz,
  last_login timestamptz,
  is_admin boolean,
  role text,
  is_online boolean,
  presence_last_seen timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  with normalized_presence as (
    select
      up.user_id,
      up.last_seen,
      (
        up.is_online = true
        and up.last_seen > now() - interval '45 seconds'
        and up.expires_at > now()
      ) as is_online
    from public.user_presence up
  )
  select
    au.id,
    au.email::text as email,
    coalesce(p.created_at, au.created_at) as created_at,
    coalesce(p.last_login, au.last_sign_in_at) as last_login,
    coalesce(p.is_admin, false) as is_admin,
    coalesce(p.role, case when coalesce(p.is_admin, false) then 'admin' else 'user' end) as role,
    coalesce(np.is_online, false) as is_online,
    np.last_seen as presence_last_seen
  from auth.users au
  left join public.profiles p on p.id = au.id
  left join normalized_presence np on np.user_id = au.id
  order by coalesce(p.created_at, au.created_at) desc nulls last
  limit greatest(limit_count, 1);
$$;

grant execute on function public.sync_profiles_from_auth() to authenticated;
grant execute on function public.admin_dashboard_metrics() to authenticated;
grant execute on function public.admin_recent_users(integer) to authenticated;
