import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { generateCheckMacValue, generateHtmlForm } from './ecpay_utils.js';

import fs from 'fs';
import path from 'path';

// Try loading environment from multiple possible filenames
const envFiles = ['.env.local', '.env.development', '.env'];
for (const file of envFiles) {
    if (fs.existsSync(file)) {
        dotenv.config({ path: file });
        console.log(`Loaded environment from ${file}`);
        break;
    }
}

// Fallback: Try reading from src/config.ts as requested by user
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback: Try reading from src/config.ts as requested by user
// Resolve path relative to THIS file (server/server.js) -> Go up one level to root -> src/config.ts
const configTsPath = path.resolve(__dirname, '../src/config.ts');

if (fs.existsSync(configTsPath)) {
    try {
        const content = fs.readFileSync(configTsPath, 'utf-8');
        console.log(`Reading config from: ${configTsPath}`);
        
        // Extract SUPABASE_URL
        if (!process.env.SUPABASE_URL) {
            const urlMatch = content.match(/SUPABASE_URL\s*=\s*(['"`])(.*?)\1/);
            if (urlMatch) {
                process.env.SUPABASE_URL = urlMatch[2];
                console.log('Using SUPABASE_URL from src/config.ts');
            }
        }
        // Extract SUPABASE_SERVICE_ROLE_KEY
        // Note: Check for both const name and value in quotes
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(['"`])(.*?)\1/);
            if (keyMatch) {
                process.env.SUPABASE_SERVICE_ROLE_KEY = keyMatch[2];
                console.log('Using SUPABASE_SERVICE_ROLE_KEY from src/config.ts');
            }
        }
    } catch (err) {
        console.error('Failed to parse src/config.ts:', err.message);
    }
} else {
    console.warn(`Config file not found at: ${configTsPath}`);
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://gmswwklptwtxceomjrbm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
let supabase;

if (!supabaseKey) {
    console.error('CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing!');
    console.log('Please ensure you have a .env file in the server/ directory with SUPABASE_SERVICE_ROLE_KEY=...');
    // We will initialize supabase as null so the server can at least start
    supabase = null;
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
}

// ECPay Test Data
const ECPAY_CONFIG = {
    MerchantID: '2000132',
    HashKey: '5294y06JbISpM5x9',
    HashIV: 'v77hoKGq4kWxNNIS',
    ActionUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', // 測試環境
};

/**
 * 1. 建立訂單 API
 * POST /api/create-order
 */
app.post('/api/create-order', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Database not initialized. Please check server/.env settings.' });
    }
    const { userId, productId, amount, itemNames } = req.body;

    try {
        // A. 建立訂單編號 (綠界要求 20 碼以內，建議包含時間戳記防重複)
        const merchantTradeNo = 'GX' + Date.now();

        console.log(`[CREATE-ORDER] Processing order for User: ${userId}, Product: ${productId}, Amount: ${amount}`);

        // B. 存入資料庫 (orders 表)
        const { data: order, error: dbError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    product_id: productId,
                    amount: amount,
                    status: 'PENDING',
                    merchant_trade_no: merchantTradeNo,
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('[CREATE-ORDER] Database Insertion Error:', JSON.stringify(dbError, null, 2));
            throw dbError;
        }

        console.log('[CREATE-ORDER] Order created in DB:', order.id);

        if (!order) {
            throw new Error('Order creation failed: No data returned from database.');
        }

        // C. 準備綠界參數
        const now = new Date();
        const formatDate = (date) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };
        const merchantTradeDate = formatDate(now);

        const baseParams = {
            MerchantID: ECPAY_CONFIG.MerchantID,
            MerchantTradeNo: merchantTradeNo,
            MerchantTradeDate: merchantTradeDate,
            PaymentType: 'aio',
            TotalAmount: amount.toString(),
            TradeDesc: 'Daozang Library Collection Purchase',
            ItemName: itemNames || '道藏藏書',
            ReturnURL: 'https://your-server.com/api/webhook/ecpay', // 綠界伺服器通知回傳位址 (需為公網 IP/Domain)
            ClientBackURL: 'https://your-frontend.com/profile', // 消費者付款完成後點選「回到特約商店」按鈕的位址
            ChoosePayment: 'ALL',
            EncryptType: '1', // 強制使用 SHA256
        };

        // D. 計算 CheckMacValue
        const checkMacValue = generateCheckMacValue(baseParams, ECPAY_CONFIG.HashKey, ECPAY_CONFIG.HashIV);
        const finalParams = { ...baseParams, CheckMacValue: checkMacValue };

        // E. 回傳 Auto-submit Form
        const form = generateHtmlForm(ECPAY_CONFIG.ActionUrl, finalParams);
        res.send(form);

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ 
            error: 'Failed to create order', 
            details: error.message || error,
            message: error.details || ''
        });
    }
});

/**
 * 2. 接收付款通知 API (Webhook)
 * POST /api/webhook/ecpay
 */
app.post('/api/webhook/ecpay', async (req, res) => {
    const data = req.body;

    try {
        // A. 驗證 CheckMacValue (安全性檢查)
        const receivedCheckMacValue = data.CheckMacValue;
        const calculatedCheckMacValue = generateCheckMacValue(data, ECPAY_CONFIG.HashKey, ECPAY_CONFIG.HashIV);

        if (receivedCheckMacValue !== calculatedCheckMacValue) {
            console.error('Invalid CheckMacValue!');
            return res.status(400).send('0|ErrorMessage');
        }

        // B. 處理付款結果 (RtnCode === '1' 代表成功)
        if (data.RtnCode === '1') {
            const merchantTradeNo = data.MerchantTradeNo;

            // 1. 查詢訂單
            const { data: order, error: findError } = await supabase
                .from('orders')
                .select('*')
                .eq('merchant_trade_no', merchantTradeNo)
                .single();

            if (findError || !order) {
                console.error('Order not found:', merchantTradeNo);
                return res.status(404).send('0|OrderNotFound');
            }

            // 如果訂單已經處理過，直接回傳 OK
            if (order.status === 'PAID') {
                return res.send('1|OK');
            }

            // 2. 使用 Transaction (或是循序執行) 更新狀態與權限
            // 更新訂單狀態
            const { error: updateError } = await supabase
                .from('orders')
                .update({ 
                    status: 'PAID', 
                    payment_date: data.PaymentDate,
                    payment_type: data.PaymentType 
                })
                .eq('id', order.id);

            if (updateError) throw updateError;

            // 3. 賦予權限 (寫入 purchases 表)
            const { error: purchaseError } = await supabase
                .from('purchases')
                .insert([
                    {
                        user_id: order.user_id,
                        product_id: order.product_id,
                        order_id: order.id
                    }
                ]);

            if (purchaseError) {
                // 如果已經存在 (可能重複發送 Webhook)，忽略錯誤
                if (purchaseError.code !== '23505') {
                    throw purchaseError;
                }
            }

            console.log(`Payment Success for Order: ${merchantTradeNo}`);
        } else {
            // 付款失敗邏輯 (可視需求更新訂單狀態為 FAILED)
            console.log(`Payment Failed for Order: ${data.MerchantTradeNo}, Code: ${data.RtnCode}`);
        }

        // C. 成功接收通知必須回傳 1|OK 給綠界
        res.send('1|OK');

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('0|ErrorMessage');
    }
});

/**
 * 3. 獲取數位經文列表
 * GET /api/products
 */
app.get('/api/products', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Database not initialized.' });
    }
    try {
        const { data, error } = await supabase
            .from('digital_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Standardize to camelCase for frontend consistency
        const mapped = data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            price: p.price,
            filePath: p.file_path,
            previewUrl: p.preview_url,
            fileType: p.file_type,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
        
        res.json(mapped);
    } catch (error) {
        console.error('Fetch Products Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message || error
        });
    }
});

/**
 * 4. 獲取會員已購買的經文
 * GET /api/my-library?userId=...
 */
app.get('/api/my-library', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Database not initialized.' });
    }
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'UserId is required' });

    try {
        const { data, error } = await supabase
            .from('purchases')
            .select(`
                id,
                created_at,
                digital_products!product_id (*)
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Database Fetch Error (Purchases):', error);
            throw error;
        }
        
        // Map to camelCase for frontend consistency
        const mapped = data.map(item => ({
            id: item.id,
            createdAt: item.created_at,
            product: item.digital_products ? {
                id: item.digital_products.id,
                title: item.digital_products.title,
                description: item.digital_products.description,
                price: item.digital_products.price,
                fileType: item.digital_products.file_type,
                filePath: item.digital_products.file_path,
                previewUrl: item.digital_products.preview_url,
                category: item.digital_products.category
            } : null
        }));
        
        res.json(mapped);
    } catch (error) {
        console.error('Fetch Library Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch library',
            details: error.message || error
        });
    }
});

/**
 * 5. 刪除數位商品 (及其關聯訂單)
 * DELETE /api/products/:id
 */
app.delete('/api/products/:id', async (req, res) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Database not initialized.' });
    }
    const { id } = req.params;
    console.log(`[DELETE] Request for product ID: ${id}`);

    try {
        // 1. 刪除相關訂單 (purchases 表有 ON DELETE CASCADE on order_id，所以會一併刪除)
        const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .eq('product_id', id);

        if (orderError) {
            console.error('Delete Orders Error:', orderError);
            throw orderError;
        }

        // 2. 刪除商品主表
        const { error: productError } = await supabase
            .from('digital_products')
            .delete()
            .eq('id', id);

        if (productError) {
            console.error('Delete Product Error:', productError);
            throw productError;
        }

        res.json({ success: true, message: '商品及其關聯資料已成功刪除' });
    } catch (error) {
        console.error('Delete API Error:', error);
        res.status(500).json({ 
            error: 'Failed to delete product',
            details: error.message || error,
            code: error.code // Include Supabase error code (e.g., '23503')
        });
    }
});

/**
 * 6. 取得安全下載連結 (Signed URL)
 * GET /api/download/:productId?userId=...
 */
app.get('/api/download/:productId', async (req, res) => {
    const { productId } = req.params;
    const { userId } = req.query;

    try {
        // A. 驗證權限：確認該用戶是否已購買此商品
        const { data: purchase, error: authError } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (authError || !purchase) {
            return res.status(403).json({ error: 'No purchase record found for this product.' });
        }

        // B. 查詢產品檔案路徑
        const { data: product, error: prodError } = await supabase
            .from('digital_products')
            .select('file_path')
            .eq('id', productId)
            .single();

        if (prodError || !product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // C. 產生 Supabase Storage 簽署連結 (效期 60 分鐘)
        const { data: signedUrl, error: storageError } = await supabase
            .storage
            .from('scriptures') // 假設 Storage Bucket 名稱為 scriptures
            .createSignedUrl(product.file_path, 3600);

        if (storageError) throw storageError;

        res.json({ url: signedUrl.signedUrl });

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Failed to generate download link.' });
    }
});

/**
 * Diagnostic Endpoint
 */
app.get('/api/diag', async (req, res) => {
    try {
        const results = {};
        results.env = {
            PORT: process.env.PORT,
            SUPABASE_URL: process.env.SUPABASE_URL ? 'PRESENT' : 'MISSING',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENT' : 'MISSING',
        };

        if (!supabase) {
            results.supabase = { connected: false, error: 'SERVICE_ROLE_KEY_MISSING' };
            return res.json(results);
        }

        const { data, error } = await supabase.from('digital_products').select('count', { count: 'exact', head: true });
        results.supabase = {
            connected: !error,
            error: error ? error.message : null,
            productsCount: data ? data[0]?.count : null
        };

        const { error: purchError } = await supabase.from('purchases').select('id').limit(1);
        results.purchasesTable = {
            exists: !purchError,
            error: purchError ? purchError.message : null
        };

        const { error: orderError } = await supabase.from('orders').select('id').limit(1);
        results.ordersTable = {
            exists: !orderError,
            error: orderError ? orderError.message : null
        };

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log('===========================================================');
    console.log(`🚀 Backend server running at http://localhost:${port}`);
    console.log(`📂 Config Source: ${fs.existsSync(configTsPath) ? 'src/config.ts' : 'Env/Default'}`);
    console.log(`🔑 Supabase Key Present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    console.log('===========================================================');
});
