-- 1) Garanta as colunas necessárias em profiles
alter table public.profiles
add column if not exists is_admin boolean default false;

alter table public.profiles
add column if not exists last_seen timestamptz;

-- 2) Garanta uma tabela própria de presença para online/offline em tempo quase real
create table if not exists public.user_presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_online boolean not null default false,
  last_seen timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_presence enable row level security;

-- 3) Backfill: traga para profiles qualquer usuário que exista no auth.users e ainda não exista em public.profiles
insert into public.profiles (id, email, created_at, last_login, last_seen, preferred_currency, role, is_admin)
select
  au.id,
  coalesce(au.email, ''),
  coalesce(au.created_at, timezone('utc', now())),
  coalesce(au.last_sign_in_at, au.created_at, timezone('utc', now())),
  coalesce(au.last_sign_in_at, au.created_at, timezone('utc', now())),
  'BRL',
  'user',
  false
from auth.users au
where not exists (
  select 1 from public.profiles p where p.id = au.id
);

-- 4) Trigger para criar profile automaticamente em novos cadastros
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
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- 5) Policies de presença para o app
-- o próprio usuário pode inserir/atualizar sua presença
drop policy if exists "Users can read own presence" on public.user_presence;
create policy "Users can read own presence"
on public.user_presence
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can upsert own presence" on public.user_presence;
create policy "Users can upsert own presence"
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

-- admin pode ver todas as presenças
drop policy if exists "Admins can view all presence" on public.user_presence;
create policy "Admins can view all presence"
on public.user_presence
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (p.is_admin = true or p.role = 'admin')
  )
);

-- 6) Policy de leitura admin para profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (p.is_admin = true or p.role = 'admin')
  )
);

-- 7) Promova sua conta para admin
update public.profiles
set is_admin = true,
    role = 'admin'
where id = 'COLE_AQUI_O_SEU_USER_ID';

-- 8) Conferência rápida
select id, email, role, is_admin, last_login, last_seen
from public.profiles
order by created_at desc;

select *
from public.user_presence
order by updated_at desc;
