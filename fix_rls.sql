-- ==========================================
-- FIX RLS & PERMISSIONS SCRIPT
-- ==========================================
-- Helper Function: Check if current user is admin
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

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.registrations enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.org_members enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.digital_products enable row level security;
alter table public.orders enable row level security;
alter table public.purchases enable row level security;

-- Drop existing policies to prevent conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

drop policy if exists "Public can view services" on public.services;
drop policy if exists "Admins can manage services" on public.services;

drop policy if exists "Public can view news" on public.news;
drop policy if exists "Admins can manage news" on public.news;

drop policy if exists "Public can view events" on public.events;
drop policy if exists "Admins can manage events" on public.events;

drop policy if exists "Public can view gallery" on public.gallery;
drop policy if exists "Admins can manage gallery" on public.gallery;
drop policy if exists "Public can view albums" on public.gallery_albums;
drop policy if exists "Admins can manage albums" on public.gallery_albums;

drop policy if exists "Public can view members" on public.org_members;
drop policy if exists "Admins can manage members" on public.org_members;

drop policy if exists "Public can view faqs" on public.faqs;
drop policy if exists "Admins can manage faqs" on public.faqs;

drop policy if exists "Public can view settings" on public.site_settings;
drop policy if exists "Admins can manage settings" on public.site_settings;

drop policy if exists "Users can view own registrations" on public.registrations;
drop policy if exists "Users can insert own registrations" on public.registrations;
drop policy if exists "Admins can update registrations" on public.registrations;
drop policy if exists "Admins can delete registrations" on public.registrations;

drop policy if exists "Public can view digital products" on public.digital_products;
drop policy if exists "Admins can manage digital products" on public.digital_products;

drop policy if exists "Users can view own purchases" on public.purchases;
drop policy if exists "Admins can manage purchases" on public.purchases;

drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;

-- Re-create Policies

-- 1. Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- 2. Services
create policy "Public can view services" on public.services for select using (true);
create policy "Admins can manage services" on public.services for all using (public.is_admin());

-- 3. News
create policy "Public can view news" on public.news for select using (true);
create policy "Admins can manage news" on public.news for all using (public.is_admin());

-- 4. Events
create policy "Public can view events" on public.events for select using (true);
create policy "Admins can manage events" on public.events for all using (public.is_admin());

-- 5. Gallery & Albums
create policy "Public can view gallery" on public.gallery for select using (true);
create policy "Admins can manage gallery" on public.gallery for all using (public.is_admin());
create policy "Public can view albums" on public.gallery_albums for select using (true);
create policy "Admins can manage albums" on public.gallery_albums for all using (public.is_admin());

-- 6. Org Members
create policy "Public can view members" on public.org_members for select using (true);
create policy "Admins can manage members" on public.org_members for all using (public.is_admin());

-- 7. FAQs
create policy "Public can view faqs" on public.faqs for select using (true);
create policy "Admins can manage faqs" on public.faqs for all using (public.is_admin());

-- 8. Site Settings
create policy "Public can view settings" on public.site_settings for select using (true);
create policy "Admins can manage settings" on public.site_settings for all using (public.is_admin());

-- 9. Registrations
create policy "Users can view own registrations" on public.registrations 
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own registrations" on public.registrations 
  for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Admins can update registrations" on public.registrations 
  for update using (public.is_admin());
create policy "Admins can delete registrations" on public.registrations 
  for delete using (public.is_admin());

-- 10. Digital Products (Scriptures)
create policy "Public can view digital products" on public.digital_products for select using (true);
create policy "Admins can manage digital products" on public.digital_products for all using (public.is_admin());

-- 11. Purchases (Unlock Records)
create policy "Users can view own purchases" on public.purchases for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins can manage purchases" on public.purchases for all using (public.is_admin());

-- 12. Orders
create policy "Users can view own orders" on public.orders 
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Users can insert own orders" on public.orders 
  for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Admins can manage orders" on public.orders 
  for all using (public.is_admin());
