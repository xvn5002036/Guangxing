-- Note: This script inserts initial sample data into the database.
-- Run this in the Supabase SQL Editor.

-- 1. Insert Site Settings (Single Row)
INSERT INTO public.site_settings (
    temple_name, address, phone, line_url,
    hero_title, hero_subtitle, 
    hero_image, 
    deity_image, deity_title, deity_intro, 
    deity_birthday, deity_birthday_label, 
    deity_duty, deity_duty_label,
    history_image_roof, history_roof_title, history_roof_desc,
    history_image_stone, history_stone_title, history_stone_desc
) VALUES (
    '新莊武壇廣行宮', '242新北市新莊區福營路500號', '(02) 2345-6789', 'https://line.me/ti/p/@temple_demo',
    '代天巡狩', '威靈顯赫 · 廣行濟世',
    'https://images.unsplash.com/photo-1592388796690-3482d8d8091e?q=80&w=2600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616401776943-41c0f04df518?q=80&w=2000&auto=format&fit=crop', '傳奇緣起', '池府王爺，諱夢彪，唐朝名將。性格剛正，愛民如子。傳說王爺於夢中見瘟神奉玉帝旨意降災，欲於井中投毒。王爺不忍百姓受難，毅然奪藥吞服，捨身救民。毒發之時，面色黝黑，雙目暴突。玉帝感其大德，敕封「代天巡狩」，專司驅瘟除疫。今人所見王爺金身之黑面怒目，實乃慈悲之至極。',
    '農曆六月十八', '聖誕千秋',
    '消災 · 解厄', '專司職責',
    'https://images.unsplash.com/photo-1542649761-0af3759b9e6f?q=80&w=1000&auto=format&fit=crop', '燕尾脊', '象徵尊貴地位，飛簷翹角，氣勢非凡。',
    'https://images.unsplash.com/photo-1596545753969-583d73b3eb38?q=80&w=1000&auto=format&fit=crop', '龍柱石雕', '匠師精雕細琢，雙龍搶珠，栩栩如生。'
);

-- 2. Insert News
INSERT INTO public.news (date, title, category) VALUES
('2024-03-15', '【公告】觀世音菩薩出家紀念日法會籌備中', '法會'),
('2024-03-01', '【活動】本宮年度平安燈、太歲燈開放線上受理', '公告'),
('2024-02-15', '【公益】護國宮春季救濟物資發放活動圓滿', '慈善');

-- 3. Insert Events
INSERT INTO public.events (date, lunar_date, title, description, time, type) VALUES
('2024-02-11', '初二', '池府王爺巡禮', '例行性巡視各庄頭，保佑四境平安。', '09:00', 'FESTIVAL'),
('2024-02-24', '十五', '補運科儀', '月中固定補運，為信眾消災解厄。', '14:00', 'RITUAL'),
('2024-03-09', '廿八', '平安祈福法會', '月底總結祈福，感謝神恩庇佑。', '08:00', 'FESTIVAL');

-- 4. Insert Services
INSERT INTO public.services (title, description, icon_name, price, type) VALUES
('太歲燈', '祈求流年平安，消災解厄，化解沖犯太歲之厄運。', 'Sun', 600, 'LIGHT'),
('光明燈', '照亮元辰，增長智慧，祈求前途光明，學業事業順利。', 'Moon', 600, 'LIGHT'),
('補財庫', '填補財庫缺漏，增強財運，守住財富，生意興隆。', 'Briefcase', 1200, 'RITUAL'),
('收驚祭改', '針對受驚嚇、運勢低落者，透過科儀安定心神，去除霉運。', 'HeartHandshake', 300, 'RITUAL'),
('隨喜捐獻', '護持宮廟建設，廣結善緣，功德無量。', 'Gift', 100, 'DONATION');

-- 5. Insert Organization Members
INSERT INTO public.org_members (name, title, category, image, "order") VALUES
('陳天賜', '宮主', 'LEADER', 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=300&auto=format&fit=crop', 1),
('林旺財', '總幹事', 'EXECUTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', 2),
('張修德', '祭典組長', 'EXECUTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop', 3),
('王淑芬', '財務長', 'EXECUTIVE', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop', 4),
('李阿土', '庶務執事', 'STAFF', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=300&auto=format&fit=crop', 5),
('吳美玲', '接待志工', 'STAFF', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop', 6),
('劉金龍', '護轎組', 'STAFF', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop', 7);
