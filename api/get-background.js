const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// [!! 關鍵 !!] 這需要一個指向您 "設定" 資料庫的新環境變數
const databaseId = process.env.NOTION_SETTINGS_DATABASE_ID; 

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    
    const prop = properties[name][type];
    
    // 處理 "Image" (Files 類型)
    if (type === 'files' && prop.length > 0) {
        return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
    }
    // 處理 "Video_URL" (URL 類型)
    if (type === 'url') {
        return prop; // 直接回傳 URL 字串
    }
    return null;
};

async function handler(req, res) {
    // 允許跨來源請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 檢查環境變數是否設定
    if (!databaseId) {
        console.error("錯誤：NOTION_SETTINGS_DATABASE_ID 未設定。");
        return res.status(500).json({ message: "伺服器設定錯誤 (Settings Database ID not configured.)" });
    }

    try {
        // 查詢 "設定" 資料庫
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 1, // 我們只需要第一筆資料 (您截圖中的 "新頁面" 那一列)
        });

        let background = {
            video: null,
            image: null,
        };

        // 如果有抓到資料
        if (response.results.length > 0) {
            const page = response.results[0];
            const { properties } = page;
            
            // 根據您 Notion 截圖中的欄位名稱
            background.video = getProperty(properties, 'Video_URL', 'url');
            background.image = getProperty(properties, 'Image', 'files');
        }

        // 回傳結果
        res.status(200).json(background);

    } catch (error) {
        console.error('抓取背景設定時發生錯誤:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch background settings', details: error.message });
    }
}

module.exports = handler;
