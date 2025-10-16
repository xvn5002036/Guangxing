const cloudinary = require('cloudinary').v2;

// 設定 Cloudinary 憑證 (會從 Vercel 環境變數讀取)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 從前端請求的 URL 中獲取 folder 參數
    const { folder } = req.query;

    if (!folder) {
        return res.status(400).json({ message: '缺少資料夾名稱。' });
    }

    try {
        // 使用 Cloudinary 的 search API 來安全地獲取指定資料夾中的所有圖片
        const searchResult = await cloudinary.search
            .expression(`folder=${folder}`)
            .sort_by('public_id', 'desc')
            .max_results(100) // 最多顯示 100 張照片
            .execute();
        
        // 將結果整理成前端需要的格式
        const images = searchResult.resources.map(img => {
            return {
                version: img.version,
                public_id: img.public_id,
                format: img.format,
            };
        });

        res.status(200).json(images);

    } catch (error) {
        console.error('從 Cloudinary 獲取圖片列表時發生錯誤:', error);
        res.status(500).json({ message: '無法獲取相簿圖片。', details: error.message });
    }
}
