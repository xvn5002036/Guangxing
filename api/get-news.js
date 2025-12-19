// IMPORTANT: This file should be placed in the `api` directory of your project.

// This imports the Notion client library
const { Client } = require("@notionhq/client");

// Initialize the Notion client using the API key from environment variables
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// This is the main function that will be executed by Vercel
async function handler(req, res) {
  // Check if the request method is GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  // Get the Database ID for the "News" database from environment variables
  const newsDatabaseId = process.env.NOTION_NEWS_DATABASE_ID;
  if (!newsDatabaseId) {
    console.error("News Database ID not found in environment variables.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  try {
    // Query the Notion database
    const response = await notion.databases.query({
      database_id: newsDatabaseId,
      // Filter to only get pages where "IsPublished" is checked
      filter: {
        property: "IsPublished",
        checkbox: {
          equals: true,
        },
      },
      // Sort the results by date, newest first
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    // Map the response to a more friendly format
    const news = response.results.map(page => {
      // It's safer to check if properties and their types exist before accessing them
      const title = page.properties.Title?.title?.[0]?.plain_text || "無標題";
      const content = page.properties.Content?.rich_text?.[0]?.plain_text || "";
      const date = page.properties.Date?.date?.start || null;
      
      return {
        id: page.id,
        title,
        content,
        date,
      };
    });

    // Send the formatted news as a JSON response
    res.status(200).json(news);

  } catch (error) {
    console.error("從 Notion API 獲取資料時發生錯誤:", error.body || error);
    res.status(500).json({ message: "Failed to fetch data from Notion." });
  }
}

module.exports = handler;
