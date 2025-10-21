// 引入 Notion 官方提供的工具
const { Client } = require('@notionhq/client');

// 初始化 Notion 客戶端
const notion = new Client({ auth: process.env.NOTION_API_KEY });
// **[新]** 從 Vercel 環境變數讀取「神明介紹」資料庫 ID
const databaseId = process.env.NOTION_DEITIES_DATABASE_ID;

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    const prop = properties[name][type];
    if (type === 'rich_text' || type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : '';
    }
    if (type === 'files' && prop.length > 0) {
        return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
    }
    return null;
};

// Vercel Serverless Function 的主要處理函式
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (!databaseId) {
        return res.status(500).json({ message: "Deities Database ID not configured." });
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
                    // 假設您有一個「排序」欄位
                    property: 'SortOrder', 
                    direction: 'ascending',
                },
            ],
        });

        const deities = response.results.map(page => {
            const { properties } = page;
            return {
                id: page.id,
                name: getProperty(properties, 'Name', 'title'),
                description: getProperty(properties, 'Description', 'rich_text'),
                image: getProperty(properties, 'Image', 'files'),
            };
        });

        res.status(200).json(deities);

    } catch (error) {
        console.error('Error fetching deities:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch deities', details: error.message });
    }
}
