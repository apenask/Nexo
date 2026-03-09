-- Nexo: maintenance mode via RPC seguro

create table if not exists public.app_settings (
  id bigint primary key,
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, maintenance_mode, updated_at)
values (1, false, now())
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_settings_touch_updated_at on public.app_settings;
create trigger trg_app_settings_touch_updated_at
before update on public.app_settings
for each row
execute function public.touch_updated_at();

create or replace function public.get_maintenance_mode()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_enabled boolean;
begin
  select maintenance_mode
    into is_enabled
  from public.app_settings
  where id = 1;

  return coalesce(is_enabled, false);
end;
$$;

create or replace function public.set_maintenance_mode(enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin_user boolean;
begin
  select coalesce(is_admin, false)
    into is_admin_user
  from public.profiles
  where id = auth.uid();

  if coalesce(is_admin_user, false) is not true then
    raise exception 'only admins can toggle maintenance mode';
  end if;

  insert into public.app_settings (id, maintenance_mode, updated_at)
  values (1, enabled, now())
  on conflict (id)
  do update set maintenance_mode = excluded.maintenance_mode,
                updated_at = now();

  return enabled;
end;
$$;

grant execute on function public.get_maintenance_mode() to anon, authenticated;
grant execute on function public.set_maintenance_mode(boolean) to authenticated;
