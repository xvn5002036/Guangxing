// 引入 Notion 官方提供的工具
const { Client } = require('@notionhq/client');

// 初始化 Notion 客戶端，授權金鑰會從 Vercel 的環境變數中讀取
const notion = new Client({ auth: process.env.NOTION_API_KEY });
// 從 Vercel 的環境變數中讀取報名紀錄資料庫的 ID
const databaseId = process.env.NOTION_REGISTRATIONS_DATABASE_ID;

// 輔助函數：這是一個小工具，用來安全地從 Notion 回傳的複雜資料中，提取出我們需要的純文字內容
const getPropertyText = (properties, name) => {
    if (!properties[name]) return null; // 如果找不到這個屬性，回傳 null
    const prop = properties[name];
    // 根據屬性類型（rich_text 或 title）來提取文字
    if (prop.rich_text && prop.rich_text.length > 0) return prop.rich_text[0].plain_text;
    if (prop.title && prop.title.length > 0) return prop.title[0].plain_text;
    return null;
};

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

    // 檢查 Vercel 環境變數是否設定妥當
    if (!databaseId) {
        return res.status(500).json({ message: "伺服器設定錯誤：找不到報名資料庫 ID。" });
    }

    try {
        // 從前端送來的請求中，解析出 name 和 phoneNumber
        const { name, phoneNumber } = req.body;

        // 檢查必要資料是否存在
        if (!name || !phoneNumber) {
            return res.status(400).json({ message: '請提供您的姓名與聯絡電話。' });
        }

        // **核心查詢邏輯**
        // 使用 Notion API，查詢 `Registrations` 資料庫
        const response = await notion.databases.query({
            database_id: databaseId,
            // 設定篩選條件：必須同時滿足兩個條件
            filter: {
                and: [
                    {
                        // 條件一：屬性 'RegistrantName' 的內容（這是一個 Title 欄位）必須等於傳入的 name
                        property: 'RegistrantName',
                        title: {
                            equals: name,
                        },
                    },
                    {
                        // 條件二：屬性 'PhoneNumber' 的內容（這是一個 Text 欄位）必須等於傳入的 phoneNumber
                        property: 'PhoneNumber',
                        rich_text: {
                            equals: phoneNumber,
                        },
                    },
                ],
            },
        });

        // 如果查詢結果的陣列長度為 0，表示找不到任何紀錄
        if (response.results.length === 0) {
            return res.status(404).json({ message: '找不到符合的報名紀錄。請確認您輸入的資料是否正確。' });
        }

        // **處理查詢結果**
        // 因為同一個人可能報名多個活動，所以我們將所有找到的紀錄都整理好並回傳
        const registrationDetails = response.results.map(record => {
             const { properties } = record;
             // 將每一筆紀錄整理成乾淨的格式
             return {
                pageId: record.id, // Notion 頁面的 ID，取消報名時會用到
                registrantName: getPropertyText(properties, 'RegistrantName'),
                eventName: getPropertyText(properties, 'EventName'),
                status: properties.Status.select.name,
                registrationId: getPropertyText(properties, 'RegistrationID'),
             };
        });

        // 將整理好的紀錄陣列回傳給前端
        res.status(200).json(registrationDetails);

    } catch (error) {
        // 如果過程中發生任何錯誤，在 Vercel 後台印出詳細錯誤，並回傳一個通用的錯誤訊息給前端
        console.error('查詢報名紀錄時發生錯誤:', error.body || error);
        res.status(500).json({ message: '查詢報名時發生內部錯誤，請稍後再試。', details: error.message });
    }
}

