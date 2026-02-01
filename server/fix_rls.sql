-- Fix for RLS policies and admin function

-- 1. Create is_admin function if not exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update digital_products policies
DROP POLICY IF EXISTS "Public can view products" ON public.digital_products;
CREATE POLICY "Public can view products" ON public.digital_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.digital_products;
CREATE POLICY "Admins can manage products" ON public.digital_products FOR ALL USING (public.is_admin());

-- 3. Update orders policies
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- 4. Fix purchases policies (Adding INSERT/ALL for admins)
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage purchases" ON public.purchases;
CREATE POLICY "Admins can manage purchases" ON public.purchases FOR ALL USING (public.is_admin());

-- 5. Final reload
NOTIFY pgrst, 'reload schema';
