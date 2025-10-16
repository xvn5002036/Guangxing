const { Client } = require('@notionhq/client');
const { v4: uuidv4 } = require('uuid');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRATIONS_DATABASE_ID;

module.exports = async (req, res) => {
    // 設置 CORS 標頭，允許任何來源的請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理瀏覽器的 preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }
    
    if (!databaseId) {
        console.error("Registrations Database ID not configured in environment variables.");
        return res.status(500).json({ message: "伺服器設定錯誤：找不到報名資料庫 ID。" });
    }

    try {
        const { registrantName, phoneNumber, eventName } = req.body;

        if (!registrantName || !phoneNumber || !eventName) {
            return res.status(400).json({ message: '缺少必要欄位：姓名、電話、活動名稱' });
        }

        const registrationId = uuidv4().split('-')[0].toUpperCase(); 
        const now = new Date();

        // 確保送出的資料結構與 Notion Text 類型匹配
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'RegistrantName': {
                    title: [{ text: { content: registrantName } }],
                },
                'PhoneNumber': {
                    // 使用 rich_text 來寫入 Text 類型的欄位
                    rich_text: [{ text: { content: phoneNumber } }],
                },
                'EventName': {
                    rich_text: [{ text: { content: eventName } }],
                },
                'RegistrationID': {
                    rich_text: [{ text: { content: registrationId } }],
                },
                'Status': {
                    select: { name: 'Confirmed' }
                },
                'Timestamp': {
                    date: { start: now.toISOString() }
                }
            },
        });

        res.status(200).json({ success: true, registrationId: registrationId });

    } catch (error) {
        // 提供更詳細的錯誤日誌給開發者看
        console.error('向 Notion API 送出資料時發生錯誤:', error.body || error);
        // 回傳給使用者的錯誤訊息
        res.status(500).json({ message: '報名資料送出失敗，請聯絡管理員。', details: error.message });
    }
};
