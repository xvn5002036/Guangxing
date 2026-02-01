-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.digital_products(id), 
    amount NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING',
    merchant_trade_no TEXT UNIQUE NOT NULL, 
    payment_type TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Digital Products Table
CREATE TABLE IF NOT EXISTS public.digital_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT,                   -- New: Author of the scripture
    content TEXT,                  -- New: Main HTML content
    description TEXT,
    category TEXT, -- e.g., 'DAOZANG'
    price NUMERIC NOT NULL DEFAULT 0,
    file_path TEXT,                -- Modified: Now optional, using attachments instead
    preview_url TEXT,
    file_type TEXT, -- e.g., 'pdf', 'docx', 'xlsx'
    attachments JSONB DEFAULT '[]'::jsonb, -- New: List of attachment objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Purchases Table (User Access Rights)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.digital_products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view products" ON public.digital_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.digital_products FOR ALL USING (public.is_admin());

-- Policies for Orders
CREATE POLICY "Admins can manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policies for Purchases
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE digital_products;
ALTER PUBLICATION supabase_realtime ADD TABLE purchases;
