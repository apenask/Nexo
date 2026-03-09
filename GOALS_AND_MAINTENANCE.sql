create table if not exists public.app_settings (
  id integer primary key,
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, maintenance_mode)
values (1, false)
on conflict (id) do nothing;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and coalesce(is_admin, false) = true
  );
$$;

grant execute on function public.is_current_user_admin() to authenticated;

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_select_authenticated" on public.app_settings;
create policy "app_settings_select_authenticated"
on public.app_settings
for select
to authenticated
using (true);

drop policy if exists "app_settings_update_admin" on public.app_settings;
create policy "app_settings_update_admin"
on public.app_settings
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

drop policy if exists "app_settings_insert_admin" on public.app_settings;
create policy "app_settings_insert_admin"
on public.app_settings
for insert
to authenticated
with check (public.is_current_user_admin());

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0,
  target_date date null,
  created_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  contribution_date date not null default current_date,
  notes text null,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own"
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goal_contributions_select_own" on public.goal_contributions;
create policy "goal_contributions_select_own"
on public.goal_contributions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goal_contributions_insert_own" on public.goal_contributions;
create policy "goal_contributions_insert_own"
on public.goal_contributions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goal_contributions_update_own" on public.goal_contributions;
create policy "goal_contributions_update_own"
on public.goal_contributions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goal_contributions_delete_own" on public.goal_contributions;
create policy "goal_contributions_delete_own"
on public.goal_contributions
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.refresh_goal_current_amount(p_goal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.goals
  set current_amount = coalesce((
    select sum(amount)
    from public.goal_contributions
    where goal_id = p_goal_id
  ), 0)
  where id = p_goal_id;
end;
$$;

grant execute on function public.refresh_goal_current_amount(uuid) to authenticated;

create or replace function public.handle_goal_contribution_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_goal_current_amount(old.goal_id);
    return old;
  end if;

  perform public.refresh_goal_current_amount(new.goal_id);

  if tg_op = 'UPDATE' and old.goal_id is distinct from new.goal_id then
    perform public.refresh_goal_current_amount(old.goal_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_goal_contributions_refresh on public.goal_contributions;
create trigger trg_goal_contributions_refresh
after insert or update or delete on public.goal_contributions
for each row execute function public.handle_goal_contribution_refresh();
