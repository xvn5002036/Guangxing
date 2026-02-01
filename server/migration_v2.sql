-- 1. 新增作者、內文、附件欄位
ALTER TABLE public.digital_products 
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. 確保價格與路徑欄位具備預設值或允許空值，避免儲存失敗
ALTER TABLE public.digital_products 
ALTER COLUMN price SET DEFAULT 0,
ALTER COLUMN file_path DROP NOT NULL,
ALTER COLUMN category SET DEFAULT '道藏藏書',
ALTER COLUMN file_type SET DEFAULT 'HTML';

-- 3. 重新加載架構緩存
NOTIFY pgrst, 'reload schema';
