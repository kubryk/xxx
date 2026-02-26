-- Create clients table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  status text default 'active' check (status in ('active', 'lead', 'client', 'archived')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.clients enable row level security;

-- Create policies
create policy "Users can view their own clients."
  on clients for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own clients."
  on clients for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own clients."
  on clients for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own clients."
  on clients for delete
  using ( auth.uid() = user_id );

-- Create client_interactions table for history/agreements
create table public.client_interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients on delete cascade not null,
  type text not null check (type in ('note', 'call', 'meeting', 'email', 'agreement')),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.client_interactions enable row level security;

-- Create policies
create policy "Users can view their own client interactions."
  on client_interactions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own client interactions."
  on client_interactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own client interactions."
  on client_interactions for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own client interactions."
  on client_interactions for delete
  using ( auth.uid() = user_id );
