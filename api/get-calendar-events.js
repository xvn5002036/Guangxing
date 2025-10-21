// api/get-calendar-events.js
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_CALENDAR_DATABASE_ID; // 使用新的環境變數

// 輔助函數：安全地從 Notion 屬性中提取內容
const getProperty = (properties, name, type) => {
    if (!properties[name] || !properties[name][type]) return null;
    const prop = properties[name][type];
    if (type === 'title') {
        return prop.length > 0 ? prop[0].plain_text : '';
    }
    if (type === 'date') {
        // Notion 的 Date 屬性可能包含開始和結束日期
        return { start: prop.start, end: prop.end };
    }
    if (type === 'rich_text') {
        return prop.length > 0 ? prop[0].plain_text : ''; // 只取純文字簡介
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
        console.error("Calendar Database ID not configured.");
        return res.status(500).json({ message: "Calendar Database ID not configured." });
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
                    property: 'StartDate', // 依照開始日期排序
                    direction: 'ascending',
                },
            ],
        });

        // 將 Notion 資料轉換成 FullCalendar 需要的格式
        const calendarEvents = response.results.map(page => {
            const { properties } = page;
            const title = getProperty(properties, 'EventName', 'title');
            const dateInfo = getProperty(properties, 'StartDate', 'date'); // 包含 start 和 end
            const description = getProperty(properties, 'Description', 'rich_text');

            if (!title || !dateInfo || !dateInfo.start) {
                return null; // 忽略缺少標題或開始日期的項目
            }

            // FullCalendar 的結束日期是 "exclusive"，Notion 是 "inclusive"
            // 如果 Notion 有結束日期，需要加一天
            let endDate = null;
            if (dateInfo.end) {
                const notionEndDate = new Date(dateInfo.end);
                // 檢查是否為全天事件 (Notion 日期格式不含時間)
                if (!dateInfo.start.includes('T')) {
                    notionEndDate.setDate(notionEndDate.getDate() + 1); // 加一天
                    endDate = notionEndDate.toISOString().split('T')[0]; // 只取 YYYY-MM-DD
                } else {
                    endDate = dateInfo.end; // 如果有時間，直接使用
                }
            }


            return {
                id: page.id,
                title: title,
                start: dateInfo.start, // 格式應為 YYYY-MM-DD 或 ISO8601
                end: endDate, // YYYY-MM-DD 或 ISO8601
                extendedProps: { // 可放入額外資訊，例如簡介
                    description: description
                }
                // allDay: !dateInfo.start.includes('T') // 判斷是否為全天事件
            };
        }).filter(event => event !== null); // 過濾掉 null 的項目

        res.status(200).json(calendarEvents);

    } catch (error) {
        console.error('Error fetching calendar events:', error.body || error);
        res.status(500).json({ message: 'Failed to fetch calendar events', details: error.message });
    }
}
