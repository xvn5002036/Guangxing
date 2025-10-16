// /api/get-events.js

const { Client } = require('@notionhq/client');

// 初始化 Notion Client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req, res) {
  // 設定 CORS headers 允許所有來源
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    return res.status(500).json({ error: 'Notion Database ID 未在環境變數中設定' });
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
      const props = page.properties;
      return {
        id: page.id,
        title: props.Title?.title[0]?.plain_text ?? '無標題',
        summary: props.Summary?.rich_text[0]?.plain_text ?? '',
        date: props.Date?.date?.start ?? '日期未定',
        coverImage: props.CoverImage?.url ?? '[https://placehold.co/600x400/cccccc/FFFFFF?text=圖片遺失](https://placehold.co/600x400/cccccc/FFFFFF?text=圖片遺失)',
      };
    });

    res.status(200).json(events);

  } catch (error) {
    console.error('從 Notion API 獲取資料時發生錯誤:', error);
    res.status(500).json({ error: '無法從 Notion 獲取資料', details: error.message });
  }
}
