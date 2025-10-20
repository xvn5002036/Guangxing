// 引入 Notion 官方提供的工具
const { Client } = require('@notionhq/client');

// 初始化 Notion 客戶端，授權金鑰會從 Vercel 的環境變數中讀取
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Vercel Serverless Function 的主要處理函式
export default async function handler(req, res) {
    // 設置 CORS 標頭，允許我們的網站前端可以跨來源請求這個 API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理瀏覽器在正式發送 POST 請求前的 OPTIONS "preflight" 請求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 只接受 POST 方法的請求
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        // 從前端送來的請求中，解析出 pageId
        // pageId 是 Notion 中每一筆紀錄的唯一識別碼
        const { pageId } = req.body;

        // 檢查 pageId 是否存在，如果不存在，就回傳一個錯誤訊息
        if (!pageId) {
            console.error("錯誤：取消請求中缺少 pageId。");
            return res.status(400).json({ message: '缺少必要的 pageId 參數。' });
        }
        
        console.log("準備將 Notion Page ID 更新為 'Cancelled':", pageId);

        // **核心更新邏輯**
        // 使用 Notion API 的 pages.update 方法，來更新指定 pageId 的紀錄
        await notion.pages.update({
            page_id: pageId, // 指定要更新哪一筆紀錄
            properties: {
                // 指定要更新哪個欄位
                'Status': {
                    // 將 Status 欄位的值（這是一個 Select 欄位）設定為 'Cancelled'
                    select: {
                        name: 'Cancelled',
                    },
                },
            },
        });
        
        console.log("成功更新 Notion Page ID:", pageId);

        // 如果更新成功，回傳一個成功的訊息給前端
        res.status(200).json({ success: true, message: '報名已成功取消。' });

    } catch (error) {
        // 如果過程中發生任何錯誤，在 Vercel 後台印出詳細錯誤，並回傳一個通用的錯誤訊息給前端
        console.error('取消報名時發生錯誤:', error.body || error);
        res.status(500).json({ message: '取消報名失敗，請稍後再試。', details: error.message });
    }
}

