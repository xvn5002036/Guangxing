-- ==========================================
-- 1. EXTENSIONS & UTILITIES
-- ==========================================
create extension if not exists "uuid-ossp";

-- Helper Function: Check if current user is admin
-- NOTE: Uses secure search_path to prevent search_path hijacking
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- ==========================================
-- 2. TABLE DEFINITIONS
-- ==========================================

-- 2.1 Profiles (Extends Auth Users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('admin', 'user')) default 'user',
  phone text,
  birth_year text,
  birth_month text,
  birth_day text,
  birth_hour text,
  city text,
  district text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.2 Services (Lighting, Rituals, etc.)
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon_name text,
  price numeric,
  type text check (type in ('LIGHT', 'DONATION', 'RITUAL')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.3 Registrations (User orders)
create table public.registrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id), -- Optional: Link to Auth User
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

-- 2.4 News (Announcements)
create table public.news (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  title text not null,
  category text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.5 Events (Calendar)
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

-- 2.6 Gallery (Photos/Videos)
create table public.gallery (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('IMAGE', 'VIDEO', 'YOUTUBE')),
  url text not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.7 Organization Members
create table public.org_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text not null,
  image text,
  category text check (category in ('LEADER', 'EXECUTIVE', 'STAFF')),
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.8 FAQs (Common Questions)
create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2.9 Site Settings (Singleton Configuration)
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

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.registrations enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.org_members enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;

-- 3.1 Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- 3.2 Public Read, Admin Write (Common Pattern)
-- Helper macro logic applied manually below

-- Services
create policy "Public can view services" on public.services for select using (true);
create policy "Admins can manage services" on public.services for all using (public.is_admin());

-- News
create policy "Public can view news" on public.news for select using (true);
create policy "Admins can manage news" on public.news for all using (public.is_admin());

-- Events
create policy "Public can view events" on public.events for select using (true);
create policy "Admins can manage events" on public.events for all using (public.is_admin());

-- Gallery
create policy "Public can view gallery" on public.gallery for select using (true);
create policy "Admins can manage gallery" on public.gallery for all using (public.is_admin());

-- Org Members
create policy "Public can view members" on public.org_members for select using (true);
create policy "Admins can manage members" on public.org_members for all using (public.is_admin());

-- FAQs
create policy "Public can view faqs" on public.faqs for select using (true);
create policy "Admins can manage faqs" on public.faqs for all using (public.is_admin());

-- Site Settings
create policy "Public can view settings" on public.site_settings for select using (true);
create policy "Admins can manage settings" on public.site_settings for all using (public.is_admin());

-- 3.3 Registrations (Special Logic: User Own + Admin All)
create policy "Users can view own registrations" on public.registrations 
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own registrations" on public.registrations 
  for insert with check (auth.uid() = user_id or public.is_admin()); -- Allow admins to register for others too

create policy "Admins can update registrations" on public.registrations 
  for update using (public.is_admin());

create policy "Admins can delete registrations" on public.registrations 
  for delete using (public.is_admin());


-- ==========================================
-- 4. REALTIME & TRIGGERS
-- ==========================================

-- 4.1 Enable Realtime for Frontend
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table services;
alter publication supabase_realtime add table news;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table gallery;
alter publication supabase_realtime add table org_members;
alter publication supabase_realtime add table registrations;
alter publication supabase_realtime add table site_settings;
alter publication supabase_realtime add table faqs;

-- 4.2 Auto-Create Profile Trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'user' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on replay
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
