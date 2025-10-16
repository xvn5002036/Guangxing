const { Client } = require('@notionhq/client');
const { v4: uuidv4 } = require('uuid');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_REGISTRATIONS_DATABASE_ID;

module.exports = async (req, res) => {
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
        return res.status(500).json({ message: "Registrations Database ID not configured." });
    }

    try {
        const { registrantName, phoneNumber, eventName } = req.body;

        if (!registrantName || !phoneNumber || !eventName) {
            return res.status(400).json({ message: 'Missing required fields: registrantName, phoneNumber, eventName' });
        }

        const registrationId = uuidv4().split('-')[0].toUpperCase(); // e.g., 5D7B97C8
        const now = new Date();

        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'RegistrantName': {
                    title: [{ text: { content: registrantName } }],
                },
                'PhoneNumber': {
                    phone_number: phoneNumber,
                },
                'EventName': {
                    rich_text: [{ text: { content: eventName } }],
                },
                'RegistrationID': {
                    rich_text: [{ text: { content: registrationId } }],
                },
                'Status': {
                    select: { name: 'Confirmed' }
                },
                'Timestamp': {
                    date: { start: now.toISOString() }
                }
            },
        });

        res.status(200).json({ success: true, registrationId: registrationId });

    } catch (error) {
        console.error('Error submitting registration to Notion:', error);
        res.status(500).json({ message: 'Failed to submit registration.', details: error.body });
    }
};

