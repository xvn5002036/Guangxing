const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRABLE_EVENTS_DATABASE_ID;

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type, subType = 'content') => {
    if (!properties[name] || !properties[name][type]) {
        return null;
    }
    const prop = properties[name][type];
    if (type === 'rich_text' || type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : '';
    }
    if (type === 'date') {
        return prop.start;
    }
    if (type === 'files') {
        if (prop.length > 0) {
            return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
        }
        return null;
    }
     if (type === 'checkbox') {
        return prop;
    }
    return prop;
};


export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 允許所有來源
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (!databaseId) {
        return res.status(500).json({ message: "Registrable Events Database ID not configured." });
    }

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'IsActive',
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: 'Date',
                    direction: 'ascending',
                },
            ],
        });

        const events = response.results.map(page => {
            const { properties } = page;
            return {
                id: page.id,
                title: getProperty(properties, 'Title', 'title'),
                date: getProperty(properties, 'Date', 'date'),
                description: getProperty(properties, 'Description', 'rich_text'),
                coverImage: getProperty(properties, 'CoverImage', 'files'),
                // 新增：讀取需要哪些欄位的設定
                requireID: getProperty(properties, 'RequireID', 'checkbox'),
                requireBirthday: getProperty(properties, 'RequireBirthday', 'checkbox'),
                requireAddress: getProperty(properties, 'RequireAddress', 'checkbox'),
                requireBirthTime: getProperty(properties, 'RequireBirthTime', 'checkbox'), // <-- [已修改] 新增讀取 RequireBirthTime
            };
        });

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching registrable events:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch registrable events', details: error.message });
    }
}