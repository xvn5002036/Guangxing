-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Services Table
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon_name text,
  price numeric,
  type text check (type in ('LIGHT', 'DONATION', 'RITUAL')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Registrations Table
create table public.registrations (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid references public.services(id),
  service_title text not null,
  name text not null,
  phone text not null,
  birth_year text,
  birth_month text,
  birth_day text,
  birth_hour text,
  city text,
  district text,
  road text,
  address_detail text,
  amount numeric not null,
  status text check (status in ('PAID', 'PENDING', 'CANCELLED')) default 'PENDING',
  is_processed boolean default false,
  payment_method text,
  payment_details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. News Table
create table public.news (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  title text not null,
  category text,
  content text, -- Added content field which might be useful
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Events Table (TempleEvent)
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  lunar_date text,
  title text not null,
  description text,
  time text,
  type text check (type in ('FESTIVAL', 'RITUAL', 'SERVICE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Gallery Table
create table public.gallery (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('IMAGE', 'VIDEO', 'YOUTUBE')),
  url text not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Organization Members Table
create table public.org_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  image text,
  category text check (category in ('LEADER', 'EXECUTIVE', 'STAFF')),
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. FAQs Table
create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Site Settings Table (Designed to hold a single row)
create table public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  temple_name text default '新莊武壇廣行宮',
  address text,
  phone text,
  line_url text,
  hero_title text,
  hero_subtitle text,
  hero_image text,
  deity_image text,
  deity_title text,
  deity_intro text,
  deity_birthday text,
  deity_birthday_label text,
  deity_duty text,
  deity_duty_label text,
  history_image_roof text,
  history_roof_title text,
  history_roof_desc text,
  history_image_stone text,
  history_stone_title text,
  history_stone_desc text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.registrations enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.org_members enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

-- Create Policies (FINAL VERSION: FULL ACCESS ENABLED)

-- 1. Services: Full Access (Read + Write)
create policy "Allow public all access" on public.services for all using (true) with check (true);

-- 2. News: Full Access
create policy "Allow public all access" on public.news for all using (true) with check (true);

-- 3. Events: Full Access
create policy "Allow public all access" on public.events for all using (true) with check (true);

-- 4. Gallery: Full Access
create policy "Allow public all access" on public.gallery for all using (true) with check (true);

-- 5. Org Members: Full Access
create policy "Allow public all access" on public.org_members for all using (true) with check (true);

-- 6. FAQs: Full Access
create policy "Allow public all access" on public.faqs for all using (true) with check (true);

-- 7. Site Settings: Full Access
create policy "Allow public all access" on public.site_settings for all using (true) with check (true);

-- 8. Registrations: Full Access
create policy "Allow public all access" on public.registrations for all using (true) with check (true);


-- 9. Realtime Configuration
-- Enable Realtime for all tables to allow the frontend to listen for changes
alter publication supabase_realtime add table services;
alter publication supabase_realtime add table news;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table gallery;
alter publication supabase_realtime add table org_members;
alter publication supabase_realtime add table registrations;
alter publication supabase_realtime add table site_settings;
alter publication supabase_realtime add table faqs;
