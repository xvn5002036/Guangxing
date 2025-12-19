// 引入 Notion 官方提供的工具
const { Client } = require('@notionhq/client');

// 初始化 Notion 客戶端
const notion = new Client({ auth: process.env.NOTION_API_KEY });
// 從 Vercel 環境變數中，讀取專門指向「活動紀實」資料庫的 ID
const databaseId = process.env.NOTION_DATABASE_ID;

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    
    const prop = properties[name][type];
    
    if (type === 'rich_text' || type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : '';
    }
    if (type === 'date') {
        return prop.start;
    }
    if (type === 'files' && prop.length > 0) {
        return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
    }
    if (type === 'checkbox') {
        return prop;
    }
    // **[新增]** 處理 URL 類型
    if (type === 'url') {
        return prop; // 直接回傳 URL 字串
    }
    return null;
};

// Vercel Serverless Function 的主要處理函式
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (!databaseId) {
        return res.status(500).json({ message: "Events Database ID not configured." });
    }

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'IsPublished',
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: 'Date',
                    direction: 'descending',
                },
            ],
        });

        const events = response.results.map(page => {
            const { properties } = page;
            return {
                id: page.id,
                title: getProperty(properties, 'Title', 'title'),
                summary: getProperty(properties, 'Summary', 'rich_text'),
                date: getProperty(properties, 'Date', 'date'),
                coverImage: getProperty(properties, 'CoverImage', 'files'),
                albumFolder: getProperty(properties, 'AlbumFolder', 'rich_text'),
                // **[新增]** 讀取 VideoLink 欄位
                videoLink: getProperty(properties, 'VideoLink', 'url'),
            };
        });

        res.status(200).json(events);

    } catch (error) {
        console.error('Error fetching events:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch events', details: error.message });
    }
}

module.exports = handler;