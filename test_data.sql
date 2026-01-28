-- ==========================================
-- TEST DATA GENERATION SCRIPT (EXPANDED - 2026 EDITION)
-- ==========================================
-- Usage: Copy and paste this into the Supabase SQL Editor.
-- This script creates 10+ sample items for most tables.
-- Dates updated to 2026.
-- ==========================================

BEGIN;

-- 1. Insert News (公告 - 10 items)
INSERT INTO public.news (date, title, category, content) VALUES
('2026-01-01', '新春祈福法會公告', '法會', '本宮將於農曆正月初一舉辦盛大祈福法會，歡迎信眾踴躍參加。當日將有誦經祈福、點燈儀式，並發放平安福袋。'),
('2026-02-15', '元宵節慶祝活動', '公告', '元宵節當晚將舉辦猜燈謎與平安湯圓分享活動。現場設有傳統燈籠製作教學，適合全家大小一同參與。'),
('2026-03-10', '愛心物資發放', '慈善', '感謝各界善信大德捐贈，本宮將於本週末進行愛心米與物資發放，關懷社區長者與弱勢家庭。'),
('2026-04-05', '清明慎終追遠法會', '法會', '清明時節雨紛紛，本宮舉辦祭祖法會，邀請善信大德一同誦經迴向歷代祖先，祈求家宅平安。'),
('2026-05-12', '母親節感恩活動', '公告', '慶祝母親節，當日來宮參拜女性信眾贈送康乃馨一朵，數量有限送完為止。'),
('2026-06-10', '端午節午時水免費索取', '公告', '端午佳節，本宮備有經神明加持之午時水，歡迎信眾自備容器來宮盛裝，可淨宅避邪。'),
('2026-07-15', '中元普渡大法會', '法會', '農曆七月十五日舉辦中元普渡，超拔十方孤魂，普施甘露。歡迎登記贊普桌。'),
('2026-08-08', '父親節祈福點燈', '公告', '為天下父親祈福，當日點光明燈半價優惠，祈求父親身體健康，工作順利。'),
('2026-09-17', '中秋月光晚會', '公告', '中秋佳節人團圓，本宮舉辦社區聯歡晚會，有卡拉OK比賽與摸彩活動，歡迎鄰里鄉親共襄盛舉。'),
('2026-10-10', '重陽敬老活動', '慈善', '發揚敬老尊賢美德，本宮致贈社區 70 歲以上長者重陽敬老禮金與壽桃一份。');

-- 2. Insert Events (行事曆/活動 - 10 items)
INSERT INTO public.events (date, lunar_date, title, description, time, type, field_config) VALUES
('2026-02-17', '正月初一', '春節祈福大法會', '農曆新年第一天，祈求全年平安順遂。', '08:00', 'FESTIVAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('2026-03-03', '正月十五', '元宵天官大帝聖誕', '恭祝上元一品天官賜福大帝聖誕千秋。', '09:00', 'RITUAL', '{"showBirth": true, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('2026-04-06', '二月十九', '觀世音菩薩聖誕', '恭祝大慈大悲觀世音菩薩聖誕千秋，舉辦大悲懺法會。', '09:30', 'RITUAL', '{"showBirth": true, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('2026-05-09', '三月廿三', '天上聖母媽祖聖誕', '恭祝天上聖母聖誕千秋，舉辦祝壽三獻禮。', '10:00', 'FESTIVAL', '{"showBirth": false, "showTime": false, "showAddress": false, "showIdNumber": false}'),
('2026-06-19', '五月初五', '端午節祈福儀式', '端午驅邪避凶，製作午時水儀式。', '11:00', 'SERVICE', '{"showBirth": false, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('2026-08-05', '六月廿四', '關聖帝君聖誕', '恭祝關聖帝君聖誕千秋，祈求事業順利、財源廣進。', '09:00', 'FESTIVAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('2026-08-27', '七月十五', '中元普渡盂蘭盆會', '普施十方，超薦冤親債主。', '13:00', 'RITUAL', '{"showBirth": true, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('2026-09-25', '八月十五', '福德正神千秋', '恭祝福德正神聖誕，祈求五穀豐登。', '08:00', 'FESTIVAL', '{"showBirth": false, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('2026-10-18', '九月初九', '中壇元帥聖誕', '恭祝中壇元帥哪吒三太子聖誕千秋。', '14:00', 'FESTIVAL', '{"showBirth": false, "showTime": false, "showAddress": false, "showIdNumber": false}'),
('2026-11-24', '十月十五', '下元水官大帝聖誕', '恭祝下元解厄水官大帝聖誕，舉辦消災解厄法會。', '09:00', 'RITUAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": true}');

-- 3. Insert Services (服務/點燈 - 10 items)
INSERT INTO public.services (title, description, price, type, field_config) VALUES
('光明燈', '照亮前程，元辰光彩。適合祈求學業、事業順利者。', 600, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('太歲燈', '安奉太歲，消災解厄。本年犯太歲生肖：馬、鼠、兔、雞 (2026)。', 800, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('財利燈', '祈求財源廣進，生意興隆，投資順利。', 1000, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('文昌燈', '祈求金榜題名，考運亨通，智慧增長。', 600, 'LIGHT', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('藥師燈', '祈求身體健康，病體康復，延年益壽。', 600, 'LIGHT', '{"showBirth": true, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('消災法會報名', '祈求消災延壽，闔家平安。', 1200, 'RITUAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": true}'),
('補財庫法會', '填補財庫缺漏，累積福報財運。', 1500, 'RITUAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": true}'),
('制解(祭改)', '制化凶煞，解冤釋結，運途順遂。', 500, 'RITUAL', '{"showBirth": true, "showTime": true, "showAddress": true, "showIdNumber": false}'),
('建廟基金捐獻', '聚沙成塔，功德無量。支持廟宇修繕與維護。', 1000, 'DONATION', '{"showBirth": false, "showTime": false, "showAddress": true, "showIdNumber": false}'),
('隨喜功德', '隨喜布施，廣結善緣，金額不限。', 100, 'DONATION', '{"showBirth": false, "showTime": false, "showAddress": true, "showIdNumber": false}');

-- 4. Insert Gallery & Albums (花絮與相簿)
-- 4.1 Insert Albums
INSERT INTO public.gallery_albums (title, description, event_date, cover_image_url) VALUES
('2026 新春祈福法會', '正月初一至十五的新春一系列祈福儀式紀錄。', '2026-02-17', 'https://images.unsplash.com/photo-1510007623952-44026330a109'),
('2026 媽祖聖誕遶境', '慶祝天上聖母聖誕，全台遶境活動盛況。', '2026-05-09', 'https://images.unsplash.com/photo-1557053503-0c252e6c518d'),
('宮廟日常與修繕', '廟宇日常維護、環境以及各項精工雕刻、古蹟修繕紀錄。', '2026-01-15', 'https://images.unsplash.com/photo-1465588042420-607248e54618');

-- 4.2 Insert Photos (Associate with albums)
INSERT INTO public.gallery (type, url, title, album_id) VALUES
('IMAGE', 'https://images.unsplash.com/photo-1510007623952-44026330a109', '晨曦祈福', (SELECT id FROM public.gallery_albums WHERE title = '2026 新春祈福法會' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1542468331-4876b306a440', '參香人潮', (SELECT id FROM public.gallery_albums WHERE title = '2026 新春祈福法會' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94', '莊嚴壇場', (SELECT id FROM public.gallery_albums WHERE title = '2026 新春祈福法會' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1557053503-0c252e6c518d', '媽祖起駕', (SELECT id FROM public.gallery_albums WHERE title = '2026 媽祖聖誕遶境' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1518002171953-a080ee321e2f', '陣頭表演', (SELECT id FROM public.gallery_albums WHERE title = '2026 媽祖聖誕遶境' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1598918804705-cb624905d452', '萬家燈火', (SELECT id FROM public.gallery_albums WHERE title = '2026 媽祖聖誕遶境' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1465588042420-607248e54618', '龍柱雕刻', (SELECT id FROM public.gallery_albums WHERE title = '宮廟日常與修繕' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1627845348981-d648b26db34d', '環境清掃', (SELECT id FROM public.gallery_albums WHERE title = '宮廟日常與修繕' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1599579769974-e35b02131238', '瓦片修補', (SELECT id FROM public.gallery_albums WHERE title = '宮廟日常與修繕' LIMIT 1)),
('IMAGE', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92', '平安宴側拍', NULL);

-- 5. Insert Org Members (組織人員 - 5 items used as example)
INSERT INTO public.org_members (name, title, category, "order", image) VALUES
('陳主委', '主任委員', 'LEADER', 1, 'https://randomuser.me/api/portraits/men/1.jpg'),
('林副主委', '副主任委員', 'LEADER', 2, 'https://randomuser.me/api/portraits/men/2.jpg'),
('張總幹事', '總幹事', 'EXECUTIVE', 3, 'https://randomuser.me/api/portraits/men/3.jpg'),
('李財務', '財務長', 'EXECUTIVE', 4, 'https://randomuser.me/api/portraits/women/4.jpg'),
('王志工', '活動組長', 'STAFF', 5, 'https://randomuser.me/api/portraits/women/5.jpg');

-- 6. Insert FAQs (常見問題 - 10 items)
INSERT INTO public.faqs (question, answer) VALUES
('請問開放時間是幾點到幾點？', '本宮每日開放時間為上午 06:00 至晚上 21:00，全年無休。辦事處服務時間為上午 08:00 至下午 17:00。'),
('如何報名點燈？', '您可以親臨本宮服務台辦理，或使用本網站的線上點燈服務進行報名與轉帳。'),
('這裡可以求籤嗎？', '可以，本宮正殿設有籤筒，請先向神明稟報姓名、生辰、地址與所求之事，擲筊獲三聖杯後即可抽籤。'),
('請問有幫忙收驚嗎？', '有的，本宮每週三、五、日下午 14:00 至 16:00 提供收驚服務，請現場排隊。'),
('可以攜帶寵物入廟嗎？', '基於莊嚴道場與衛生考量，請勿攜帶寵物入殿（導盲犬除外），也請將寵物置於廟埕繫好。'),
('請問有停車場嗎？', '本宮後方設有免費停車場，約可容納 20 輛小客車，若遇大型活動請多利用周邊收費停車場。'),
('如何捐款支持廟務？', '歡迎至辦公室捐款箱投遞，或利用線上捐款功能。亦可劃撥至本宮帳戶，詳情請見關於我們。'),
('太歲燈什麼時候開始報名？', '每年農曆十一月初一起開始受理次年度太歲燈報名，額滿為止。'),
('法會需要自備供品嗎？', '參加法會者，本宮會統一準備供品。若您想額外敬供，亦可自備鮮花素果。'),
('有提供平安符嗎？', '有，請至正殿向神明祈求後，至服務台領取平安符，並過爐加持。');

-- 7. Insert Registrations (15 items)
-- Using subqueries to link to the services/events created above
INSERT INTO public.registrations (
    service_id, service_title, name, phone, 
    birth_year, birth_month, birth_day, birth_hour, 
    city, district, address_detail, 
    amount, status, is_processed, payment_method, bank_last_five
) VALUES 
(
    (SELECT id FROM public.services WHERE title = '光明燈' LIMIT 1),
    '光明燈', '王小明', '0912345678', 
    '1990', '01', '15', '吉', 
    '台北市', '大安區', '信義路三段100號', 
    600, 'PAID', true, 'ATM', '12345'
),
(
    (SELECT id FROM public.services WHERE title = '太歲燈' LIMIT 1),
    '太歲燈', '李美麗', '0922333444', 
    '1985', '05', '20', '午', 
    '新北市', '板橋區', '文化路一段50號', 
    800, 'PENDING', false, 'CASH', NULL
),
(
    NULL, -- Event/Other
    '春節祈福大法會', '張志強', '0933444555', 
    '1970', '10', '10', '辰', 
    '台中市', '西屯區', '台灣大道三段99號', 
    0, 'PAID', true, 'FREE', NULL
),
(
    (SELECT id FROM public.services WHERE title = '消災法會報名' LIMIT 1),
    '消災法會報名', '林雅婷', '0955666777', 
    '1995', '08', '08', '未', 
    '高雄市', '苓雅區', '三多四路1號', 
    1200, 'PAID', false, 'ATM', '98765'
),
(
    (SELECT id FROM public.services WHERE title = '光明燈' LIMIT 1),
    '光明燈', '陳大同', '0966777888', 
    '2000', '12', '25', '申', 
    '台北市', '士林區', '中正路200號', 
    600, 'PENDING', false, 'ATM', NULL
),
(
    (SELECT id FROM public.services WHERE title = '財利燈' LIMIT 1),
    '財利燈', '郭富城', '0977888999', 
    '1980', '02', '02', '子', 
    '新北市', '新莊區', '中正路888號', 
    1000, 'PAID', true, 'ATM', '16888'
),
(
    (SELECT id FROM public.services WHERE title = '文昌燈' LIMIT 1),
    '文昌燈', '劉德華', '0988999000', 
    '2005', '06', '06', '巳', 
    '台北市', '松山區', '民生東路五段50號', 
    600, 'PAID', true, 'CASH', NULL
),
(
    NULL, -- Event
    '清明祭祖法會', '張學友', '0911222333', 
    '1992', '04', '04', '午', 
    '桃園市', '中壢區', '中正路300號', 
    0, 'PAID', true, 'FREE', NULL
),
(
    (SELECT id FROM public.services WHERE title = '藥師燈' LIMIT 1),
    '藥師燈', '黎明', '0922333444', 
    '1975', '09', '09', '戌', 
    '新竹市', '東區', '光復路二段100號', 
    600, 'PENDING', false, 'ATM', '54321'
),
(
    (SELECT id FROM public.services WHERE title = '補財庫法會' LIMIT 1),
    '補財庫法會', '周杰倫', '0933444555', 
    '1988', '01', '18', '丑', 
    '新北市', '林口區', '文化一路100號', 
    1500, 'PAID', false, 'ATM', '88888'
),
(
    (SELECT id FROM public.services WHERE title = '光明燈' LIMIT 1),
    '光明燈', '蔡依林', '0944555666', 
    '1982', '09', '15', '卯', 
    '台北市', '大安區', '忠孝東路四段200號', 
    600, 'PAID', true, 'ATM', '11111'
),
(
    (SELECT id FROM public.services WHERE title = '太歲燈' LIMIT 1),
    '太歲燈', '五月天', '0955666777', 
    '1997', '03', '29', '亥', 
    '台北市', '北投區', '大同街10號', 
    800, 'PAID', true, 'CASH', NULL
),
(
    (SELECT id FROM public.services WHERE title = '光明燈' LIMIT 1),
    '光明燈', '林志玲', '0966777888', 
    '1974', '11', '29', '寅', 
    '台南市', '中西區', '府前路一段1號', 
    600, 'PENDING', false, 'ATM', NULL
),
(
    NULL, -- Event
    '中元普渡大法會', '王心凌', '0977888999', 
    '1985', '09', '05', '酉', 
    '新北市', '永和區', '中正路50號', 
    0, 'PAID', true, 'FREE', NULL
),
(
    (SELECT id FROM public.services WHERE title = '制解(祭改)' LIMIT 1),
    '制解(祭改)', '蕭敬騰', '0988999000', 
    '1987', '03', '30', '午', 
    '台北市', '南港區', '忠孝東路七段300號', 
    500, 'PAID', true, 'ATM', '77777'
);

-- 8. Insert Site Settings (Default)
-- Uses ON CONFLICT to avoid errors if settings already exist (assuming single row table logic usually enforced by app, but here just insert if empty)
INSERT INTO public.site_settings (temple_name, address)
SELECT '新莊武壇廣行宮', '新北市新莊區新北大道七段xx號'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

COMMIT;

-- ==========================================
-- END OF SCRIPT
-- ==========================================
