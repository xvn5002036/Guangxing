const { Client } = require('@notionhq/client');
const { v4: uuidv4 } = require('uuid');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRATIONS_DATABASE_ID;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST requests are allowed' });
    if (!databaseId) { console.error("Registrations Database ID not configured."); return res.status(500).json({ message: "伺服器設定錯誤：找不到報名資料庫 ID。" }); }
    try {
        const { registrantName, phoneNumber, eventName, idNumber, birthday, address } = req.body;
        if (!registrantName || !phoneNumber || !eventName) return res.status(400).json({ message: '缺少姓名、電話、活動名稱等必要欄位' });
        const registrationId = uuidv4().split('-')[0].toUpperCase();
        const now = new Date();
        const propertiesToCreate = {
            'RegistrantName': { title: [{ text: { content: registrantName } }] },
            'PhoneNumber': { rich_text: [{ text: { content: phoneNumber } }] },
            'EventName': { rich_text: [{ text: { content: eventName } }] },
            'RegistrationID': { rich_text: [{ text: { content: registrationId } }] },
            'Status': { select: { name: 'Confirmed' } },
            'Timestamp': { date: { start: now.toISOString() } },
        };
        if (idNumber) propertiesToCreate['IDNumber'] = { rich_text: [{ text: { content: idNumber } }] };
        if (birthday) propertiesToCreate['Birthday'] = { date: { start: birthday } };
        if (address) propertiesToCreate['Address'] = { rich_text: [{ text: { content: address } }] };
        await notion.pages.create({ parent: { database_id: databaseId }, properties: propertiesToCreate });
        res.status(200).json({ success: true, registrationId: registrationId });
    } catch (error) {
        console.error('向 Notion API 送出報名資料時發生錯誤:', error.body || error);
        res.status(500).json({ message: '報名資料送出失敗，請聯絡管理員。', details: error.message });
    }
};

