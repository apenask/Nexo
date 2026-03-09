
create table if not exists public.goals(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 target_amount numeric not null,
 saved_amount numeric default 0,
 created_at timestamptz default now()
);

create table if not exists public.app_settings(
 id int primary key default 1,
 maintenance_mode boolean default false
);

insert into public.app_settings(id,maintenance_mode)
values(1,false)
on conflict(id) do nothing;
