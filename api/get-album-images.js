const cloudinary = require('cloudinary').v2;

// 設定 Cloudinary 憑證
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { folder } = req.query;

    // --- 偵錯日誌 #1 ---
    console.log(`[DEBUG] 收到請求，準備查詢 Cloudinary 資料夾: "${folder}"`);

    if (!folder) {
        console.error("[DEBUG] 錯誤：請求中缺少 folder 參數。");
        return res.status(400).json({ message: '缺少資料夾名稱。' });
    }

    try {
        const expression = `folder=${folder}`;
        
        // --- 偵錯日誌 #2 ---
        console.log(`[DEBUG] 準備向 Cloudinary 發送搜尋指令: "${expression}"`);

        const searchResult = await cloudinary.search
            .expression(expression)
            .sort_by('public_id', 'desc')
            .max_results(100)
            .execute();
        
        // --- 偵錯日誌 #3 ---
        // 這一行會印出 Cloudinary 回傳的「所有」原始資料，是我們破案的關鍵！
        console.log('[DEBUG] 收到來自 Cloudinary 的完整回覆:', JSON.stringify(searchResult, null, 2));

        const images = searchResult.resources.map(img => ({
            version: img.version,
            public_id: img.public_id,
            format: img.format,
        }));
        
        // --- 偵錯日誌 #4 ---
        console.log(`[DEBUG] 處理完成，找到 ${images.length} 張圖片。`);

        res.status(200).json({
            images: images,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });

    } catch (error) {
        // --- 偵錯日誌 #5 ---
        console.error('[DEBUG] 在與 Cloudinary 溝通時發生嚴重錯誤:', error);
        res.status(500).json({ message: '無法獲取相簿圖片。', details: error.message });
    }
}

module.exports = handler;

