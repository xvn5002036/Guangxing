const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRABLE_EVENTS_DATABASE_ID;

const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    const prop = properties[name][type];
    if (type === 'rich_text' || type === 'title') return prop.length > 0 ? prop[0].plain_text : '';
    if (type === 'date') return prop.start;
    if (type === 'files' && prop.length > 0) return prop[0].type === 'external' ? prop[0].external.url : prop[0].file.url;
    if (type === 'checkbox') return prop;
    return prop;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!databaseId) return res.status(500).json({ message: "Registrable Events Database ID not configured." });
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: { property: 'IsActive', checkbox: { equals: true } },
            sorts: [{ property: 'Date', direction: 'ascending' }],
        });
        const events = response.results.map(page => ({
            id: page.id,
            title: getProperty(page.properties, 'Title', 'title'),
            date: getProperty(page.properties, 'Date', 'date'),
            description: getProperty(page.properties, 'Description', 'rich_text'),
            coverImage: getProperty(page.properties, 'CoverImage', 'files'),
            requireID: getProperty(page.properties, 'RequireID', 'checkbox'),
            requireBirthday: getProperty(page.properties, 'RequireBirthday', 'checkbox'),
            requireAddress: getProperty(page.properties, 'RequireAddress', 'checkbox'),
        }));
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching registrable events:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch registrable events', details: error.message });
    }
};

