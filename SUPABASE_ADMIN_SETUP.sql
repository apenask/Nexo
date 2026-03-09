-- 1) Garanta as colunas necessárias
alter table profiles
add column if not exists is_admin boolean default false;

alter table profiles
add column if not exists last_seen timestamptz;

-- 2) Torne a sua conta admin
-- Troque o UUID abaixo pelo User ID da sua conta no Supabase Auth
update profiles
set is_admin = true,
    role = 'admin'
where id = 'COLE_AQUI_O_SEU_USER_ID';

-- 3) Conferência rápida
select id, email, role, is_admin, last_login, last_seen
from profiles
order by created_at desc;

-- 4) Se você usa RLS e o painel admin não carregar dados,
-- crie esta policy para leitura de profiles por administradores.
-- Só rode se for necessário.
-- drop policy if exists "Admins can view all profiles" on profiles;
-- create policy "Admins can view all profiles"
-- on profiles
-- for select
-- to authenticated
-- using (
--   exists (
--     select 1
--     from profiles p
--     where p.id = auth.uid()
--       and (p.is_admin = true or p.role = 'admin')
--   )
-- );
