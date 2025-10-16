const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRATIONS_DATABASE_ID;

// 輔助函數：安全地從 Notion 屬性中提取內容
const getPropertyText = (properties, name) => {
    if (!properties[name] || !properties[name].rich_text || properties[name].rich_text.length === 0) {
        return null;
    }
    return properties[name].rich_text[0].plain_text;
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    if (!databaseId) {
        return res.status(500).json({ message: "伺服器設定錯誤：找不到報名資料庫 ID。" });
    }

    try {
        const { registrationId, phoneNumber } = req.body;

        if (!registrationId || !phoneNumber) {
            return res.status(400).json({ message: '請提供報名編號與聯絡電話。' });
        }

        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                and: [
                    {
                        property: 'RegistrationID',
                        rich_text: {
                            equals: registrationId.toUpperCase(),
                        },
                    },
                    {
                        property: 'PhoneNumber',
                        rich_text: {
                            equals: phoneNumber,
                        },
                    },
                ],
            },
        });

        if (response.results.length === 0) {
            return res.status(404).json({ message: '找不到符合的報名紀錄。請確認您輸入的資料是否正確。' });
        }

        const record = response.results[0];
        const { properties } = record;
        
        const registrationDetails = {
            pageId: record.id,
            registrantName: properties.RegistrantName.title[0].plain_text,
            eventName: getPropertyText(properties, 'EventName'),
            status: properties.Status.select.name,
        };

        res.status(200).json(registrationDetails);

    } catch (error) {
        console.error('查詢報名紀錄時發生錯誤:', error.body || error);
        res.status(500).json({ message: '查詢報名時發生內部錯誤，請稍後再試。', details: error.message });
    }
}
