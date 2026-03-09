-- =====================================================
-- NEXO • ADMIN + PRESENÇA + CADASTRO SEM ATRITO
-- Rode tudo no SQL Editor do Supabase
-- Troque COLE_AQUI_O_SEU_USER_ID antes de executar a parte do admin
-- =====================================================

-- 1) Colunas necessárias em profiles
alter table public.profiles
add column if not exists is_admin boolean default false;

alter table public.profiles
add column if not exists last_seen timestamptz;

-- 2) Tabela de presença quase em tempo real
create table if not exists public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_online boolean not null default false,
  last_seen timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_presence enable row level security;

-- 3) Função helper para saber se o usuário atual é admin
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (coalesce(p.is_admin, false) = true or p.role = 'admin')
  );
$$;

-- 4) Backfill + sincronização de auth.users para profiles
create or replace function public.sync_profiles_from_auth()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at, last_login, last_seen, preferred_currency, role, is_admin)
  select
    au.id,
    coalesce(au.email, ''),
    coalesce(au.created_at, timezone('utc', now())),
    coalesce(au.last_sign_in_at, au.created_at, timezone('utc', now())),
    coalesce(au.last_sign_in_at, au.created_at, timezone('utc', now())),
    coalesce(p.preferred_currency, 'BRL'),
    coalesce(p.role, 'user'),
    coalesce(p.is_admin, false)
  from auth.users au
  left join public.profiles p on p.id = au.id
  where p.id is null;

  update public.profiles p
  set
    email = coalesce(au.email, p.email),
    last_login = coalesce(au.last_sign_in_at, p.last_login),
    last_seen = coalesce(p.last_seen, au.last_sign_in_at, p.last_login, timezone('utc', now()))
  from auth.users au
  where au.id = p.id;
end;
$$;

select public.sync_profiles_from_auth();

-- 5) Trigger para novos usuários criarem profile automaticamente
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, created_at, last_login, last_seen, preferred_currency, role, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.created_at, timezone('utc', now())),
    coalesce(new.last_sign_in_at, new.created_at, timezone('utc', now())),
    coalesce(new.last_sign_in_at, new.created_at, timezone('utc', now())),
    'BRL',
    'user',
    false
  )
  on conflict (id) do update set
    email = excluded.email,
    last_login = excluded.last_login,
    last_seen = coalesce(public.profiles.last_seen, excluded.last_seen);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- 6) Policies em profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.is_current_user_admin());

-- 7) Policies em user_presence

drop policy if exists "Users can read own presence" on public.user_presence;
create policy "Users can read own presence"
on public.user_presence
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own presence" on public.user_presence;
create policy "Users can insert own presence"
on public.user_presence
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own presence" on public.user_presence;
create policy "Users can update own presence"
on public.user_presence
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can view all presence" on public.user_presence;
create policy "Admins can view all presence"
on public.user_presence
for select
to authenticated
using (public.is_current_user_admin());

-- 8) Funções RPC para painel admin
create or replace function public.admin_dashboard_metrics()
returns table (
  total_users bigint,
  online_users bigint,
  offline_users bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with sync as (
    select public.sync_profiles_from_auth()
  ),
  total as (
    select count(*)::bigint as total_users from public.profiles
  ),
  online as (
    select count(*)::bigint as online_users
    from public.user_presence up
    where up.is_online = true
      and up.expires_at is not null
      and up.expires_at > timezone('utc', now())
  )
  select
    total.total_users,
    online.online_users,
    greatest(total.total_users - online.online_users, 0)::bigint as offline_users
  from total, online;
$$;

create or replace function public.admin_recent_users(limit_count integer default 20)
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
set search_path = public
stable
as $$
  with sync as (
    select public.sync_profiles_from_auth()
  )
  select
    p.id,
    p.email,
    p.created_at,
    p.last_login,
    coalesce(p.is_admin, false) as is_admin,
    p.role,
    (
      coalesce(up.is_online, false) = true
      and up.expires_at is not null
      and up.expires_at > timezone('utc', now())
    ) as is_online,
    up.last_seen as presence_last_seen
  from public.profiles p
  left join public.user_presence up on up.user_id = p.id
  order by p.created_at desc nulls last
  limit greatest(limit_count, 1);
$$;

revoke all on function public.admin_dashboard_metrics() from public;
revoke all on function public.admin_recent_users(integer) from public;
grant execute on function public.admin_dashboard_metrics() to authenticated;
grant execute on function public.admin_recent_users(integer) to authenticated;
grant execute on function public.sync_profiles_from_auth() to authenticated;

-- 9) Realtime para profiles e presence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    EXECUTE 'alter publication supabase_realtime add table public.profiles';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_presence'
  ) THEN
    EXECUTE 'alter publication supabase_realtime add table public.user_presence';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 10) Promover sua conta para admin
update public.profiles
set is_admin = true,
    role = 'admin'
where id = 'COLE_AQUI_O_SEU_USER_ID';

-- 11) Conferência rápida
select * from public.admin_dashboard_metrics();
select * from public.admin_recent_users(20);
