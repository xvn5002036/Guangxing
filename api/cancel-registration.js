const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST requests are allowed' });
    try {
        const { pageId } = req.body;
        if (!pageId) { console.error("錯誤：取消請求中缺少 pageId。"); return res.status(400).json({ message: '缺少必要的 pageId 參數。' }); }
        await notion.pages.update({
            page_id: pageId,
            properties: { 'Status': { select: { name: 'Cancelled' } } },
        });
        res.status(200).json({ success: true, message: '報名已成功取消。' });
    } catch (error) {
        console.error('取消報名時發生錯誤:', error.body || error);
        res.status(500).json({ message: '取消報名失敗，請稍後再試。', details: error.message });
    }
};

