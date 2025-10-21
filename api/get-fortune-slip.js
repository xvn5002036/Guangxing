const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
// **[新]** 從 Vercel 環境變數讀取「籤詩」資料庫 ID
const databaseId = process.env.NOTION_FORTUNE_DATABASE_ID;

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    const prop = properties[name][type];
    if (type === 'rich_text' || type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : '';
    }
    // 假設您用 Select 欄位來標示吉凶
    if (type === 'select') {
        return prop.name;
    }
    return null;
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (!databaseId) {
        return res.status(500).json({ message: "Fortune Database ID not configured." });
    }

    try {
        // 抓取資料庫中所有的籤詩 (假設不超過 100 支)
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 100,
        });

        if (response.results.length === 0) {
            return res.status(404).json({ message: "籤詩資料庫為空。" });
        }

        // 從結果中隨機選取一支
        const randomSlip = response.results[Math.floor(Math.random() * response.results.length)];
        const { properties } = randomSlip;

        // 將籤詩資料整理成乾淨格式
        const slipData = {
            id: randomSlip.id,
            title: getProperty(properties, 'Title', 'title'), // e.g., "第一首 甲子"
            type: getProperty(properties, 'Type', 'select'), // e.g., "上上"
            poem: getProperty(properties, 'Poem', 'rich_text'), // 籤詩內文
            interpretation: getProperty(properties, 'Interpretation', 'rich_text'), // 解曰
        };

        res.status(200).json(slipData);

    } catch (error) {
        console.error('Error fetching fortune slip:', error.body || error);
        res.status(500).json({ message: '求籤時發生錯誤', details: error.message });
    }
}
