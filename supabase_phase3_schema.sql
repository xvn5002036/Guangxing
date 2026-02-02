-- Phase 3 Schema: Product Enhancements & Navigation

-- 1. Add Tags and Promotion fields to Digital Products
alter table digital_products 
add column if not exists tags text[] default '{}',
add column if not exists is_limited_time boolean default false,
add column if not exists promotion_end_date timestamp with time zone;

-- 2. Create index for Tags search efficiency
create index if not exists idx_digital_products_tags on digital_products using gin(tags);
