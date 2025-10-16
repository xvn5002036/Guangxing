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
        return res.status(500).json({ message: "Registrations Database ID not configured." });
    }

    try {
        const { registrantName, phoneNumber, eventName } = req.body;

        if (!registrantName || !phoneNumber || !eventName) {
            return res.status(400).json({ message: '缺少必要欄位：姓名、電話、活動名稱' });
        }

        // 產生一個較短的唯一報名編號
        const registrationId = uuidv4().split('-')[0].toUpperCase(); 
        const now = new Date();

        // ** UPDATED PART **
        // 將 phoneNumber 屬性修改為 rich_text 以匹配 Notion 中 Text 類型的欄位
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'RegistrantName': {
                    title: [{ text: { content: registrantName } }],
                },
                'PhoneNumber': {
                    rich_text: [{ text: { content: phoneNumber } }], // <<-- 這行已修改
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
        console.error('Error submitting registration to Notion:', error);
        res.status(500).json({ message: '報名資料送出失敗。', details: error.body });
    }
};


