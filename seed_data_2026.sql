-- ==========================================
-- 2026 Seed Data for Guangxing Temple
-- ==========================================

-- Clean up existing data for clean slate (Optional - Comment out if appending)
-- truncate table public.events cascade;
-- truncate table public.news cascade;
-- truncate table public.services cascade;
-- truncate table public.gallery_albums cascade;
-- truncate table public.digital_products cascade;

-- ==========================================
-- 1. SERVICES (2026 Offerings)
-- ==========================================
INSERT INTO public.services (title, description, icon_name, price, type, field_config, created_at) VALUES 
('2026 丙午年太歲燈', '祈求流年平安，消災解厄，化解沖犯太歲之厄運。屬馬、鼠、兔、雞者必點。', 'Sun', 600, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true}'::jsonb, '2025-11-01 00:00:00+00'),
('2026 光明燈', '照亮元辰，增長智慧，祈求前途光明，學業事業順利。', 'Moon', 600, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true}'::jsonb, '2025-11-01 00:00:00+00'),
('2026 財利燈', '填補財庫缺漏，增強財運，守住財富，生意興隆。', 'Briefcase', 1200, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true}'::jsonb, '2025-11-01 00:00:00+00'),
('2026 新春補運科儀', '新春期間固定補運，為信眾消災解厄，祈求一年順遂。', 'Sunrise', 1500, 'RITUAL', '{"showBirth": true, "showAddress": true}'::jsonb, '2025-12-01 00:00:00+00'),
('每月收驚祭改', '針對受驚嚇、運勢低落者，透過科儀安定心神，去除霉運。', 'HeartHandshake', 300, 'RITUAL', '{"showBirth": true, "showAddress": true}'::jsonb, '2026-01-01 00:00:00+00'),
('建廟基金隨喜', '護持宮廟建設，廣結善緣，功德無量。', 'Gift', 100, 'DONATION', '{"intro": "隨喜功德"}'::jsonb, '2026-01-01 00:00:00+00');

-- ==========================================
-- 2. EVENTS (2026 Calendar - Year of the Horse)
-- ==========================================
-- Lunar New Year: 2026-02-17
INSERT INTO public.events (date, lunar_date, title, description, time, type, created_at) VALUES 
('2026-01-24', '十二月初六', '歲末謝平安法會', '感謝神恩庇佑一年平安，舉辦酬神戲劇與團拜。', '08:00', 'FESTIVAL', NOW()),
('2026-02-16', '除夕', '除夕團拜', '辭舊迎新，子時開廟門，發放開運紅包。', '23:00', 'FESTIVAL', NOW()),
('2026-02-17', '正月初一', '新春祈福法會', '恭賀新禧，祈求國泰民安，風調雨順。', '09:00', 'FESTIVAL', NOW()),
('2026-02-21', '正月初五', '接財神大法會', '迎請五路財神，祈求財源廣進。', '09:00', 'RITUAL', NOW()),
('2026-02-25', '正月初九', '玉皇上帝萬壽', '天公生，擴大舉辦祝壽大典。', '00:00', 'FESTIVAL', NOW()),
('2026-03-03', '正月十五', '元宵節乞龜活動', '慶祝上元天官大帝聖誕，舉辦乞龜平安祭。', '14:00', 'FESTIVAL', NOW()),
('2026-04-10', '二月廿三', '春季禮斗法會', '誦經禮懺，延壽消災。', '08:00', 'RITUAL', NOW()),
('2026-05-10', '三月廿三', '天上聖母聖誕', '恭祝媽祖娘娘聖誕千秋，舉辦祝壽三獻禮。', '09:00', 'FESTIVAL', NOW()),
('2026-06-19', '五月初五', '端午節午時水祭', '取午時水，淨化壇場，驅除瘟疫。', '11:00', 'RITUAL', NOW()),
('2026-07-31', '六月十八', '池府王爺聖誕千秋', '本宮主神池府王爺聖誕，年度最大盛典，過火儀式。', '08:00', 'FESTIVAL', NOW()),
('2026-08-27', '七月十五', '中元普渡大法會', '慶讚中元，普施孤魂，祈求陰陽兩利。', '13:00', 'RITUAL', NOW()),
('2026-09-25', '八月十五', '中秋福德正神聖誕', '土地公生日，祈求五穀豐登，財運亨通。', '09:00', 'FESTIVAL', NOW()),
('2026-10-19', '九月初九', '重陽敬老法會', '中壇元帥聖誕，舉辦太子爺祝壽活動與敬老餐會。', '10:00', 'FESTIVAL', NOW()),
('2026-11-23', '十月十五', '下元水官大帝聖誕', '消災解厄，祈求來年運勢順暢。', '09:00', 'RITUAL', NOW());

-- ==========================================
-- 3. NEWS (Announcements)
-- ==========================================
INSERT INTO public.news (date, title, category, content, created_at) VALUES 
('2026-01-05', '【公告】2026年(丙午年)太歲燈、光明燈開始受理登記', '公告', '本宮即日起開放現場與線上報名點燈服務，名額有限，請信眾提早辦理。', NOW()),
('2026-01-20', '【活動】歲末大掃除與志工招募', '活動', '歡迎十方信眾一同參與歲末宮廟環境整理，廣植福田。', NOW()),
('2026-02-10', '【重要】春節期間參拜動線與交通管制說明', '公告', '為紓解春節人潮，初一至初五廟前廣場實施交通管制，請配合現場人員指揮。', NOW()),
('2026-02-28', '【法會】元宵乞龜活動辦法公佈', '活動', '今年備有發財金龜共66隻，歡迎信眾擲筊祈求，帶回鎮宅招財。', NOW()),
('2026-04-01', '【公益】急難救助金申請開跑', '慈善', '本宮秉持王爺濟世精神，開放清寒家庭申請急難救助，詳情請洽服務台。', NOW()),
('2026-06-01', '【慶典】池府王爺聖誕籌備委員會成立', '公告', '年度盛典即將到來，誠徵活動組與各種護駕志工。', NOW()),
('2026-07-15', '【活動】第二屆「廣行盃」書法比賽', '文化', '弘揚傳統文化，歡迎國中小學生報名參加，獎品豐富。', NOW()),
('2026-08-01', '【法會】中元普渡贊普桌數統計中', '公告', '欲參加普渡之信眾，請於農曆七月初十前完成登記，以利供品準備。', NOW());

-- ==========================================
-- 4. DIGITAL PRODUCTS (Scriptures)
-- ==========================================
INSERT INTO public.digital_products (title, author, category, price, description, content, file_type, created_at) VALUES 
('太上老君說常清靜經 (電子版)', '太上老君', '道藏經典', 0, '道教修身養性之根本經典，每日誦讀可澄心靜慮。', '老君曰：大道無形，生育天地；大道無情，運行日月...', 'HTML', NOW()),
('池府王爺真經', '廣行宮編輯部', '本宮出版', 100, '記載池府王爺生平與顯化事蹟，信徒必讀。', '池府王爺，乃唐朝名將...', 'PDF', NOW()),
('金光神咒解析', '張天師', '咒語教學', 200, '道教八大神咒之一，護身保命必修。含咒語發音與手印教學。', '天地玄宗，萬炁本根...', 'VIDEO', NOW()),
('道德經 (完整註釋版)', '老子', '道藏經典', 300, '五千言道德經，附名家註釋與白話翻譯。', '道可道，非常道...', 'HTML', NOW()),
('拜斗科儀手冊', '法務組', '儀軌', 150, '詳細解說拜斗之意義與儀軌流程，讓信眾更了解法會內涵。', '拜斗，即禮拜北斗七星...', 'PDF', NOW());

-- ==========================================
-- 5. GALLERY (Sample Albums)
-- ==========================================
WITH album_ins AS (
  INSERT INTO public.gallery_albums (title, description, cover_image_url, event_date) 
  VALUES ('2025 池府王爺聖誕回顧', '精彩的過火與繞境紀錄', 'https://images.unsplash.com/photo-1542596594-649edbc13630', '2025-07-12')
  RETURNING id
)
INSERT INTO public.gallery (album_id, type, url, title) 
SELECT id, 'IMAGE', 'https://images.unsplash.com/photo-1580489944761-15a19d654956', '繞境隊伍' FROM album_ins
UNION ALL
SELECT id, 'IMAGE', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36', '過火儀式' FROM album_ins;

-- ==========================================
-- 6. FAQS
-- ==========================================
-- (Appending to existing FAQs)
INSERT INTO public.faqs (question, answer, created_at) VALUES 
('如果忘記來參加法會怎麼辦？', '若您已此報名補運或點燈，疏文皆會由法師代為上稟，您不用擔心，功效是一樣的。', NOW()),
('可以代替家人點燈嗎？', '可以。請準備家人的姓名、出生年月日（農曆為佳）以及居住地址即可辦理。', NOW()),
('線上祈福的疏文如何處理？', '線上報名資料將由廟務人員彙整，統一謄寫疏文，並於法會當日依科儀焚化上奏。', NOW());
