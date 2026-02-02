-- Phase 2 Schema: Reading Experience & Community

-- 1. Bookmarks Table (Reading Progress)
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  progress jsonb not null default '{}'::jsonb, -- Stores { scrollTop: 100, chapter: 1 } etc.
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- RLS for Bookmarks
alter table bookmarks enable row level security;

create policy "Users can view their own bookmarks"
  on bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert/update their own bookmarks"
  on bookmarks for all
  using ( auth.uid() = user_id );


-- 2. Notes Table (Personal & Community)
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  content text not null,
  is_public boolean default false, -- False = Private Note, True = Community Insight
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Notes
alter table notes enable row level security;

create policy "Users can view their own notes"
  on notes for select
  using ( auth.uid() = user_id );

create policy "Users can view public notes"
  on notes for select
  using ( is_public = true );

create policy "Users can manage their own notes"
  on notes for all
  using ( auth.uid() = user_id );


-- 3. Notifications Table (System Alerts)
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Notifications
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using ( auth.uid() = user_id );


-- 4. Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_bookmarks_updated_at on bookmarks;
create trigger update_bookmarks_updated_at
    before update on bookmarks
    for each row
    execute procedure update_updated_at_column();

drop trigger if exists update_notes_updated_at on notes;
create trigger update_notes_updated_at
    before update on notes
    for each row
    execute procedure update_updated_at_column();
