// api/get-articles.js
const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_ARTICLES_DATABASE_ID; // 使用新的環境變數

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
    return null;
};
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (!databaseId) {
        console.error("Articles Database ID not configured."); // 加入錯誤提示
        return res.status(500).json({ message: "Articles Database ID not configured." });
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
                    property: 'PublishDate', // 依照發布日期排序
                    direction: 'descending', // 最新在前
                },
            ],
        });

        const articles = response.results.map(page => {
            const { properties } = page;
            return {
                id: page.id,
                title: getProperty(properties, 'Title', 'title'),
                content: getProperty(properties, 'Content', 'rich_text'), // 抓取 Content 欄位
                publishDate: getProperty(properties, 'PublishDate', 'date'), // 抓取 PublishDate 欄位
            };
        });

        res.status(200).json(articles);

    } catch (error) {
        console.error('Error fetching articles:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch articles', details: error.message });
    }
}

module.exports = handler;