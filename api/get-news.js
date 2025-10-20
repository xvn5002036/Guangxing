const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_NEWS_DATABASE_ID;

const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    const prop = properties[name][type];
    if (type === 'rich_text' || type === 'title') return prop.length > 0 ? prop[0].plain_text : '';
    if (type === 'date') return prop.start;
    return null;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!databaseId) return res.status(500).json({ message: "News Database ID not configured." });
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: { property: 'IsPublished', checkbox: { equals: true } },
            sorts: [{ property: 'Date', direction: 'descending' }],
        });
        const news = response.results.map(page => ({
            id: page.id,
            title: getProperty(page.properties, 'Title', 'title'),
            date: getProperty(page.properties, 'Date', 'date'),
            content: getProperty(page.properties, 'Content', 'rich_text'),
        }));
        res.status(200).json(news);
    } catch (error) {
        console.error('Error fetching news:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch news', details: error.message });
    }
};

