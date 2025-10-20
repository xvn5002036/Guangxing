// 引入 Notion 官方提供的工具
const { Client } = require('@notionhq/client');

// 初始化 Notion 客戶端，授權金鑰會從 Vercel 的環境變數中讀取
const notion = new Client({ auth: process.env.NOTION_API_KEY });
// 從 Vercel 環境變數中，讀取專門指向「活動紀實」資料庫的 ID
// 請確保您在 Vercel 中設定了名為 NOTION_DATABASE_ID 的變數
const databaseId = process.env.NOTION_DATABASE_ID;

// 輔助函數：這是一個小工具，用來安全地從 Notion 回傳的複雜資料中，提取出我們需要的內容
const getProperty = (properties, name, type) => {
    // 檢查屬性是否存在，不存在則回傳 null
    if (!properties[name] || !properties[name][type]) return null;
    
    const prop = properties[name][type];
    
    // 根據不同類型來提取資料
    if (type === 'rich_text' || type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : ''; // 提取純文字
    }
    if (type === 'date') {
        return prop.start; // 提取開始日期
    }
    // **關鍵修正**：正確讀取 Files & media 類型的內容
    if (type === 'files' && prop.length > 0) {
        // Notion 的檔案有兩種來源：外部連結(external)或內部上傳(file)
        return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
    }
    if (type === 'checkbox') {
        return prop; // 回傳 true 或 false
    }
    return null;
};

// Vercel Serverless Function 的主要處理函式
export default async function handler(req, res) {
    // 設置 CORS 標頭，允許我們的網站前端可以跨來源請求這個 API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理瀏覽器的 OPTIONS "preflight" 請求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 檢查 Vercel 環境變數是否設定妥當
    if (!databaseId) {
        return res.status(500).json({ message: "Events Database ID not configured." });
    }

    try {
        // **核心查詢邏輯**
        // 使用 Notion API，查詢指定的資料庫
        const response = await notion.databases.query({
            database_id: databaseId,
            // 設定篩選條件：只抓取 IsPublished 欄位被打勾的紀錄
            filter: {
                property: 'IsPublished',
                checkbox: {
                    equals: true,
                },
            },
            // 設定排序方式：依照 Date 欄位，由新到舊排序
            sorts: [
                {
                    property: 'Date',
                    direction: 'descending',
                },
            ],
        });

        // **處理查詢結果**
        // 將 Notion 回傳的複雜資料，整理成前端需要的乾淨格式
        const events = response.results.map(page => {
            const { properties } = page;
            return {
                id: page.id,
                title: getProperty(properties, 'Title', 'title'),
                summary: getProperty(properties, 'Summary', 'rich_text'),
                date: getProperty(properties, 'Date', 'date'),
                coverImage: getProperty(properties, 'CoverImage', 'files'),
                albumFolder: getProperty(properties, 'AlbumFolder', 'rich_text'),
            };
        });

        // 將整理好的資料陣列回傳給前端
        res.status(200).json(events);

    } catch (error) {
        // 如果過程中發生任何錯誤，在 Vercel 後台印出詳細錯誤，並回傳一個通用的錯誤訊息給前端
        console.error('Error fetching events:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch events', details: error.message });
    }
}

