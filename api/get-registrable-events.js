const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRABLE_EVENTS_DATABASE_ID;

module.exports = async (req, res) => {
    if (!databaseId) {
        return res.status(500).json({ error: "Registrable Events Database ID not configured." });
    }

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "IsActive",
                checkbox: {
                    equals: true,
                },
            },
            sorts: [
                {
                    property: 'EventDate',
                    direction: 'ascending',
                },
            ],
        });

        const events = response.results.map(page => {
            const props = page.properties;
            return {
                id: page.id,
                eventName: props.EventName?.title[0]?.plain_text || '無標題活動',
                description: props.Description?.rich_text[0]?.plain_text || '',
                eventDate: props.EventDate?.date?.start || '日期未定',
                coverImage: props.CoverImage?.url || null,
                maxAttendees: props.MaxAttendees?.number || 0,
            };
        });
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(events);

    } catch (error) {
        console.error("Error fetching registrable events from Notion API:", error);
        res.status(500).json({ error: "Failed to fetch data from Notion.", details: error.message });
    }
};

