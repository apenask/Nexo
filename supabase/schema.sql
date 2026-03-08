-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Profiles Table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  preferred_currency text default 'BRL' not null,
  role text default 'user' not null check (role in ('user', 'admin'))
);

-- Create Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  budget_percentage numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Cards Table
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  limit_amount numeric not null,
  closing_date integer not null,
  due_date integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Recurring Transactions Table
create table public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('entrada', 'saida')),
  amount numeric not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  start_date date not null,
  recurrence_type text not null check (recurrence_type in ('mensal', 'semanal', 'anual')),
  status text not null check (status in ('active', 'paused', 'cancelled')) default 'active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Transactions Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('entrada', 'saida')),
  amount numeric not null,
  description text not null,
  date date not null,
  category_id uuid references public.categories(id) on delete set null,
  card_id uuid references public.cards(id) on delete set null,
  is_planned boolean default false,
  installment_index integer,
  installment_count integer,
  installment_group_id text,
  recurring_transaction_id uuid references public.recurring_transactions(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.transactions enable row level security;

-- Create Policies
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Users can view their own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Admins can view all categories" on public.categories for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert their own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update their own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete their own categories" on public.categories for delete using (auth.uid() = user_id);

create policy "Users can view their own cards" on public.cards for select using (auth.uid() = user_id);
create policy "Admins can view all cards" on public.cards for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert their own cards" on public.cards for insert with check (auth.uid() = user_id);
create policy "Users can update their own cards" on public.cards for update using (auth.uid() = user_id);
create policy "Users can delete their own cards" on public.cards for delete using (auth.uid() = user_id);

create policy "Users can view their own recurring transactions" on public.recurring_transactions for select using (auth.uid() = user_id);
create policy "Admins can view all recurring transactions" on public.recurring_transactions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert their own recurring transactions" on public.recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own recurring transactions" on public.recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own recurring transactions" on public.recurring_transactions for delete using (auth.uid() = user_id);

create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Admins can view all transactions" on public.transactions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert their own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, last_login)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update last_login
create or replace function public.handle_user_login()
returns trigger as $$
begin
  update public.profiles
  set last_login = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for user login (updates last_login when auth.users is updated, e.g., last_sign_in_at)
create trigger on_auth_user_login
  after update of last_sign_in_at on auth.users
  for each row execute procedure public.handle_user_login();

