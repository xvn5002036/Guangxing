import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NewsItem, TempleEvent, ServiceItem, GalleryItem, GalleryAlbum, Registration, SiteSettings, OrgMember, FAQItem } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// Helper to get formatted date for current month
const getRelativeDate = (day: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${month}-${d}`;
};

const INITIAL_NEWS: NewsItem[] = [
    { id: 'n1', date: '2024.03.15', title: '【公告】觀世音菩薩出家紀念日法會籌備中', category: '法會' },
    { id: 'n2', date: '2024.03.01', title: '【活動】本宮年度平安燈、太歲燈開放線上受理', category: '公告' },
    { id: 'n3', date: '2024.02.15', title: '【公益】護國宮春季救濟物資發放活動圓滿', category: '慈善' },
];

const INITIAL_EVENTS: TempleEvent[] = [
    { id: 'e1', date: getRelativeDate(2), lunarDate: '初二', title: '池府王爺巡禮', description: '例行性巡視各庄頭，保佑四境平安。', time: '09:00', type: 'FESTIVAL' },
    { id: 'e2', date: getRelativeDate(15), lunarDate: '十五', title: '補運科儀', description: '月中固定補運，為信眾消災解厄。', time: '14:00', type: 'RITUAL' },
    { id: 'e3', date: getRelativeDate(28), lunarDate: '廿八', title: '平安祈福法會', description: '月底總結祈福，感謝神恩庇佑。', time: '08:00', type: 'FESTIVAL' },
];

const INITIAL_SERVICES: ServiceItem[] = [
    { id: 's1', title: "太歲燈", description: "祈求流年平安，消災解厄，化解沖犯太歲之厄運。", iconName: "Sun", price: 600, type: 'LIGHT' },
    { id: 's2', title: "光明燈", description: "照亮元辰，增長智慧，祈求前途光明，學業事業順利。", iconName: "Moon", price: 600, type: 'LIGHT' },
    { id: 's3', title: "補財庫", description: "填補財庫缺漏，增強財運，守住財富，生意興隆。", iconName: "Briefcase", price: 1200, type: 'RITUAL' },
    { id: 's4', title: "收驚祭改", description: "針對受驚嚇、運勢低落者，透過科儀安定心神，去除霉運。", iconName: "HeartHandshake", price: 300, type: 'RITUAL' },
    { id: 's5', title: "隨喜捐獻", description: "護持宮廟建設，廣結善緣，功德無量。", iconName: "Gift", price: 100, type: 'DONATION' }
];

const INITIAL_ORG: OrgMember[] = [
    { id: 'o1', name: '陳天賜', title: '宮主', category: 'LEADER', image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=300&auto=format&fit=crop' },
    { id: 'o2', name: '林旺財', title: '總幹事', category: 'EXECUTIVE', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
    { id: 'o3', name: '張修德', title: '祭典組長', category: 'EXECUTIVE', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop' },
    { id: 'o4', name: '王淑芬', title: '財務長', category: 'EXECUTIVE', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
    { id: 'o5', name: '李阿土', title: '庶務執事', category: 'STAFF', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=300&auto=format&fit=crop' },
    { id: 'o6', name: '吳美玲', title: '接待志工', category: 'STAFF', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop' },
    { id: 'o7', name: '劉金龍', title: '護轎組', category: 'STAFF', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop' },
];

const INITIAL_FAQS: FAQItem[] = [
    { id: 'f1', question: '請問參拜的順序為何？', answer: '請先至天公爐參拜玉皇上帝，再入正殿參拜主神池府王爺，隨後參拜龍邊（左側）陪祀神明，最後參拜虎邊（右側）陪祀神明。' },
    { id: 'f2', question: '如何辦理點燈服務？', answer: '您可以使用本網站的「線上服務」進行登記與繳費，或親臨本宮服務台辦理。每盞燈位均有神明庇佑，名額有限。' },
    { id: 'f3', question: '擲筊求籤有什麼禁忌嗎？', answer: '請示前請先洗手淨心，清楚稟報姓名、生辰、住址與所求之事。一事一籤，切勿一事多求。若遇笑筊或陰筊，請重新誠心稟報。' },
    { id: 'f4', question: '還願的方式有哪些？', answer: '依據您當時許願的內容為主。一般可準備鮮花素果、添香油錢、或協助宮廟事務志工。' },
];

const DEFAULT_SETTINGS: SiteSettings = {
    templeName: '新莊武壇廣行宮',
    address: '242新北市新莊區福營路500號',
    phone: '(02) 2345-6789',
    lineUrl: 'https://line.me/ti/p/@temple_demo',
    heroTitle: '代天巡狩',
    heroSubtitle: '威靈顯赫 · 廣行濟世',
    heroImage: 'https://images.unsplash.com/photo-1592388796690-3482d8d8091e?q=80&w=2600&auto=format&fit=crop',
    deityImage: 'https://images.unsplash.com/photo-1616401776943-41c0f04df518?q=80&w=2000&auto=format&fit=crop',
    deityTitle: '傳奇緣起',
    deityIntro: '池府王爺，諱夢彪，唐朝名將。性格剛正，愛民如子。傳說王爺於夢中見瘟神奉玉帝旨意降災，欲於井中投毒。王爺不忍百姓受難，毅然奪藥吞服，捨身救民。毒發之時，面色黝黑，雙目暴突。玉帝感其大德，敕封「代天巡狩」，專司驅瘟除疫。今人所見王爺金身之黑面怒目，實乃慈悲之至極。',
    deityBirthday: '農曆六月十八',
    deityBirthdayLabel: '聖誕千秋',
    deityDuty: '消災 · 解厄',
    deityDutyLabel: '專司職責',
    historyImageRoof: 'https://images.unsplash.com/photo-1542649761-0af3759b9e6f?q=80&w=1000&auto=format&fit=crop',
    historyRoofTitle: '燕尾脊',
    historyRoofDesc: '象徵尊貴地位，飛簷翹角，氣勢非凡。',
    historyImageStone: 'https://images.unsplash.com/photo-1596545753969-583d73b3eb38?q=80&w=1000&auto=format&fit=crop',
    historyStoneTitle: '龍柱石雕',
    historyStoneDesc: '匠師精雕細琢，雙龍搶珠，栩栩如生。',
    historyTitle1: '草創時期 (清乾隆年間)',
    historyDesc1: '本宮源起於清乾隆年間，先民渡海來台，為求平安渡過黑水溝，隨身奉請池府王爺金身。初時僅以茅草搭建簡易神壇供奉，然神威顯赫，庇佑庄頭五穀豐登，信眾日增。',
    historyTitle2: '建廟大業 (民國六十年)',
    historyDesc2: '隨著地方繁榮，舊壇已不敷使用。地方仕紳與信眾集資購地，依循古法地理勘輿，擇定現址動土興建。歷時三年，大殿巍峨聳立，燕尾飛簷，剪黏交趾，展現傳統工藝之美。',
    historyTitle3: '現代弘法 (今日)',
    historyDesc3: '不僅是信仰中心，更致力於公益慈善與文化傳承。引入數位科技，設立線上祭祀平台，讓傳統信仰跨越時空，繼續守護每一位虔誠的靈魂。',

    // Default Field Configs
    configDonation: {
        showBirth: false,
        showTime: false,
        showAddress: false,
        showIdNumber: false
    },
    configLight: {
        showBirth: true,
        showTime: true,
        showAddress: true,
        showIdNumber: false
    },
    configEvent: {
        showBirth: true,
        showTime: false,
        showAddress: true,
        showIdNumber: true
    }
};

interface DataContextType {
    news: NewsItem[];
    events: TempleEvent[];
    services: ServiceItem[];
    gallery: GalleryItem[];
    galleryAlbums: GalleryAlbum[];
    registrations: Registration[];
    orgMembers: OrgMember[];
    faqs: FAQItem[];
    siteSettings: SiteSettings;

    // Auth
    user: any;
    userProfile: any; // Using any to avoid import cycles or complex type mapping
    signOut: () => Promise<void>;
    fetchUserProfile: (userId: string) => Promise<void>;

    addNews: (item: Omit<NewsItem, 'id'>) => void;
    updateNews: (id: string, item: Partial<NewsItem>) => void;
    deleteNews: (id: string) => void;

    addEvent: (item: Omit<TempleEvent, 'id'>) => void;
    updateEvent: (id: string, item: Partial<TempleEvent>) => void;
    deleteEvent: (id: string) => void;

    addService: (item: Omit<ServiceItem, 'id'>) => void;
    updateService: (id: string, item: Partial<ServiceItem>) => void;
    deleteService: (id: string) => void;

    addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
    addGalleryItems: (items: Omit<GalleryItem, 'id'>[]) => Promise<void>;
    updateGalleryItem: (id: string, item: Partial<GalleryItem>) => Promise<void>;
    deleteGalleryItem: (id: string) => Promise<void>;

    addGalleryAlbum: (album: Omit<GalleryAlbum, 'id'>) => Promise<void>;
    updateGalleryAlbum: (id: string, album: Partial<GalleryAlbum>) => Promise<void>;
    deleteGalleryAlbum: (id: string) => Promise<void>;

    addOrgMember: (item: Omit<OrgMember, 'id'>) => void;
    updateOrgMember: (id: string, item: Partial<OrgMember>) => void;

    deleteOrgMember: (id: string) => void;

    addFaq: (item: Omit<FAQItem, 'id'>) => void;
    updateFaq: (id: string, item: Partial<FAQItem>) => void;
    deleteFaq: (id: string) => void;

    addRegistration: (reg: Omit<Registration, 'id' | 'createdAt'>) => void;
    updateRegistration: (id: string, reg: Partial<Registration>) => void;
    deleteRegistration: (id: string) => void;
    getRegistrationsByPhone: (phone: string) => Registration[];

    updateSiteSettings: (settings: Partial<SiteSettings>) => void;

    resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
    const [events, setEvents] = useState<TempleEvent[]>(INITIAL_EVENTS);
    const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [orgMembers, setOrgMembers] = useState<OrgMember[]>(INITIAL_ORG);
    const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);

    // === SUPABASE SYNCHRONIZATION ===

    // Helper to fetch and subscribe to a table
    const syncTable = <T extends { id: string }>(
        tableName: string,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        orderByCol: string = 'created_at',
        ascending: boolean = false,
        initialData?: T[]
    ) => {
        if (!isSupabaseConfigured()) {
            if (initialData) setter(initialData);
            return () => { };
        }

        const fetchData = async () => {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order(orderByCol, { ascending });

            if (!error && data) {
                // Auto-map snake_case to camelCase keys
                const toCamel = (s: string) => s.replace(/(_\w)/g, k => k[1].toUpperCase());
                const mapKeys = (o: any) => {
                    const newO: any = {};
                    for (const key in o) {
                        newO[toCamel(key)] = o[key];
                    }
                    return newO;
                };

                const mappedData = data.map(mapKeys);
                setter(mappedData as any);
            }
        };

        fetchData();

        const channel = supabase
            .channel(`${tableName}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
                fetchData(); // Simplest strategy: refetch on any change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    // 1. Sync Site Settings
    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        // Settings is a single row table usually, or we query key-value. 
        // Schema says 'site_settings' table usually with one row.
        const fetchSettings = async () => {
            const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
            if (!error && data) {
                // Need to map snake_case to camelCase manually here because Settings has many fields
                const mappedSettings: SiteSettings = {
                    templeName: data.temple_name || DEFAULT_SETTINGS.templeName,
                    address: data.address || DEFAULT_SETTINGS.address,
                    phone: data.phone || DEFAULT_SETTINGS.phone,
                    lineUrl: data.line_url || DEFAULT_SETTINGS.lineUrl,
                    heroTitle: data.hero_title || DEFAULT_SETTINGS.heroTitle,
                    heroSubtitle: data.hero_subtitle || DEFAULT_SETTINGS.heroSubtitle,
                    heroImage: data.hero_image || DEFAULT_SETTINGS.heroImage,
                    deityImage: data.deity_image || DEFAULT_SETTINGS.deityImage,
                    deityTitle: data.deity_title || DEFAULT_SETTINGS.deityTitle,
                    deityIntro: data.deity_intro || DEFAULT_SETTINGS.deityIntro,
                    deityBirthday: data.deity_birthday || DEFAULT_SETTINGS.deityBirthday,
                    deityBirthdayLabel: data.deity_birthday_label || DEFAULT_SETTINGS.deityBirthdayLabel,
                    deityDuty: data.deity_duty || DEFAULT_SETTINGS.deityDuty,
                    deityDutyLabel: data.deity_duty_label || DEFAULT_SETTINGS.deityDutyLabel,
                    historyImageRoof: data.history_image_roof || DEFAULT_SETTINGS.historyImageRoof,
                    historyRoofTitle: data.history_roof_title || DEFAULT_SETTINGS.historyRoofTitle,
                    historyRoofDesc: data.history_roof_desc || DEFAULT_SETTINGS.historyRoofDesc,
                    historyImageStone: data.history_image_stone || DEFAULT_SETTINGS.historyImageStone,
                    historyStoneTitle: data.history_stone_title || DEFAULT_SETTINGS.historyStoneTitle,
                    historyStoneDesc: data.history_stone_desc || DEFAULT_SETTINGS.historyStoneDesc,
                    historyTitle1: data.history_title1 || DEFAULT_SETTINGS.historyTitle1,
                    historyDesc1: data.history_desc1 || DEFAULT_SETTINGS.historyDesc1,
                    historyTitle2: data.history_title2 || DEFAULT_SETTINGS.historyTitle2,
                    historyDesc2: data.history_desc2 || DEFAULT_SETTINGS.historyDesc2,
                    historyTitle3: data.history_title3 || DEFAULT_SETTINGS.historyTitle3,
                    historyDesc3: data.history_desc3 || DEFAULT_SETTINGS.historyDesc3,

                    // New Form Configs (Assuming JSONB or similar structure in DB, or we just rely on defaults for now if DB not updated)
                    configDonation: data.config_donation || DEFAULT_SETTINGS.configDonation,
                    configLight: data.config_light || DEFAULT_SETTINGS.configLight,
                    configEvent: data.config_event || DEFAULT_SETTINGS.configEvent,
                };
                setSiteSettings(mappedSettings);
            } else {
                // If empty, maybe insert defaults? for now just use defaults in state
            }
        };

        fetchSettings();
        // Subscribe to settings changes
        const channel = supabase.channel('settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, fetchSettings)
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, []);

    // 2. Sync Collections
    useEffect(() => syncTable('news', setNews, 'date', false, INITIAL_NEWS as any), []);
    useEffect(() => syncTable('events', setEvents, 'date', true, INITIAL_EVENTS as any), []);
    useEffect(() => syncTable('services', setServices, 'created_at', false, INITIAL_SERVICES as any), []);
    useEffect(() => syncTable('gallery', setGallery, 'created_at', false), []);
    useEffect(() => syncTable('org_members', setOrgMembers, 'order', true, INITIAL_ORG as any), []); // Assuming 'order' column exists
    useEffect(() => syncTable('registrations', setRegistrations, 'created_at', false), []);
    useEffect(() => syncTable('faqs', setFaqs, 'created_at', false, INITIAL_FAQS as any), []);
    useEffect(() => syncTable('gallery_albums', setGalleryAlbums, 'created_at', false), []);


    // === ACTIONS ===

    const addNews = async (item: Omit<NewsItem, 'id'>) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('news').insert([item]);
            if (error) console.error("Error adding news:", error);
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setNews(prev => [newItem, ...prev]);
        }
    };
    const updateNews = async (id: string, item: Partial<NewsItem>) => {
        if (isSupabaseConfigured()) {
            await supabase.from('news').update(item).eq('id', id);
        } else {
            setNews(prev => prev.map(n => n.id === id ? { ...n, ...item } : n));
        }
    };
    const deleteNews = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) throw error;
        } else {
            setNews(prev => prev.filter(n => n.id !== id));
        }
    };

    const addEvent = async (item: Omit<TempleEvent, 'id'>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = { ...item };

            if ('lunarDate' in item) {
                if (item.lunarDate) dbItem.lunar_date = item.lunarDate;
                delete dbItem.lunarDate;
            }

            if (item.fieldConfig) {
                dbItem.field_config = item.fieldConfig;
                delete dbItem.fieldConfig;
            }

            // Strip autogenerated fields
            delete dbItem.id;
            delete dbItem.createdAt;
            delete dbItem.updatedAt;

            const { error } = await supabase.from('events').insert([dbItem]);
            if (error) {
                console.error("Supabase add event error:", error);
                throw error;
            }
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setEvents(prev => [...prev, newItem].sort((a, b) => a.date.localeCompare(b.date)));
        }
    };
    const updateEvent = async (id: string, item: Partial<TempleEvent>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = { ...item };
            if ('lunarDate' in item) {
                if (item.lunarDate !== undefined) dbItem.lunar_date = item.lunarDate;
                delete dbItem.lunarDate;
            }
            if (item.fieldConfig) {
                dbItem.field_config = item.fieldConfig;
                delete dbItem.fieldConfig;
            }
            // Strip fields that shouldn't be updated or cause schema errors
            delete dbItem.id;
            delete dbItem.createdAt;
            delete dbItem.updatedAt;
            const { error } = await supabase.from('events').update(dbItem).eq('id', id);
            if (error) {
                console.error("Supabase update event error:", error);
                throw error;
            }
        } else {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
        }
    };
    const deleteEvent = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
        } else {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
    };

    const addService = async (item: Omit<ServiceItem, 'id'>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = {};
            const toSnake = (s: string) => s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

            for (const key in item) {
                if (Object.prototype.hasOwnProperty.call(item, key)) {
                    const snakeKey = toSnake(key);
                    // Explicitly handle fieldConfig as JSONB
                    if (key === 'fieldConfig') {
                        dbItem.field_config = (item as any)[key];
                    } else if (key === 'iconName') {
                        dbItem.icon_name = (item as any)[key];
                    } else if (!['id', 'createdAt', 'updatedAt'].includes(key)) {
                        dbItem[snakeKey] = (item as any)[key];
                    }
                }
            }

            const { error } = await supabase.from('services').insert([dbItem]);
            if (error) {
                console.error("Supabase add service error:", error);
                throw error;
            }
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setServices(prev => [...prev, newItem]);
        }
    };
    const updateService = async (id: string, item: Partial<ServiceItem>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = { ...item };
            if ('iconName' in item) {
                if (item.iconName !== undefined) dbItem.icon_name = item.iconName;
                delete dbItem.iconName;
            }
            if (item.fieldConfig) {
                dbItem.field_config = item.fieldConfig;
                delete dbItem.fieldConfig;
            }
            // Strip fields that shouldn't be updated
            delete dbItem.id;
            delete dbItem.createdAt;
            delete dbItem.updatedAt;
            const { error } = await supabase.from('services').update(dbItem).eq('id', id);
            if (error) {
                console.error("Supabase update service error:", error);
                throw error;
            }
        } else {
            setServices(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
        }
    };
    const deleteService = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
        } else {
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = { ...item };
            // Robust mapping: always map albumId to album_id and remove camelCase key
            dbItem.album_id = item.albumId || null;
            delete dbItem.albumId;

            const { error } = await supabase.from('gallery').insert([dbItem]);
            if (error) throw error;
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setGallery(prev => [...prev, newItem]);
        }
    };
    const addGalleryItems = async (items: Omit<GalleryItem, 'id'>[]) => {
        if (isSupabaseConfigured()) {
            const dbItems = items.map(item => {
                const dbItem: any = { ...item };
                dbItem.album_id = item.albumId || null;
                delete dbItem.albumId;
                return dbItem;
            });
            const { error } = await supabase.from('gallery').insert(dbItems);
            if (error) throw error;
        } else {
            const newItems = items.map((item, i) => ({ ...item, id: `local_${Date.now()}_${i}` }));
            setGallery(prev => [...prev, ...newItems]);
        }
    };
    const updateGalleryItem = async (id: string, item: Partial<GalleryItem>) => {
        if (isSupabaseConfigured()) {
            const dbItem: any = { ...item };
            if (item.albumId) {
                dbItem.album_id = item.albumId;
                delete dbItem.albumId;
            }
            await supabase.from('gallery').update(dbItem).eq('id', id);
        } else {
            setGallery(prev => prev.map(g => g.id === id ? { ...g, ...item } : g));
        }
    };
    const deleteGalleryItem = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('gallery').delete().eq('id', id);
            if (error) throw error;
        } else {
            setGallery(prev => prev.filter(g => g.id !== id));
        }
    };

    const addGalleryAlbum = async (album: Omit<GalleryAlbum, 'id'>) => {
        if (isSupabaseConfigured()) {
            const dbAlbum: any = { ...album };
            if (album.coverImageUrl) {
                dbAlbum.cover_image_url = album.coverImageUrl;
                delete dbAlbum.coverImageUrl;
            }
            if (album.eventDate) {
                dbAlbum.event_date = album.eventDate;
                delete dbAlbum.eventDate;
            }
            await supabase.from('gallery_albums').insert([dbAlbum]);
        } else {
            const newAlbum = { ...album, id: `local_album_${Date.now()}` };
            setGalleryAlbums(prev => [newAlbum as GalleryAlbum, ...prev]);
        }
    };

    const updateGalleryAlbum = async (id: string, album: Partial<GalleryAlbum>) => {
        if (isSupabaseConfigured()) {
            const dbAlbum: any = { ...album };
            if (album.coverImageUrl) {
                dbAlbum.cover_image_url = album.coverImageUrl;
                delete dbAlbum.coverImageUrl;
            }
            if (album.eventDate) {
                dbAlbum.event_date = album.eventDate;
                delete dbAlbum.eventDate;
            }
            // Remove derived fields
            delete dbAlbum.photoCount;
            await supabase.from('gallery_albums').update(dbAlbum).eq('id', id);
        } else {
            setGalleryAlbums(prev => prev.map(a => a.id === id ? { ...a, ...album } : a));
        }
    };

    const deleteGalleryAlbum = async (id: string) => {
        if (isSupabaseConfigured()) {
            // First check if it has photos? Or let cascade handle if configured (better)
            // But we don't have cascade in current schema view yet.
            const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
            if (error) throw error;
        } else {
            setGalleryAlbums(prev => prev.filter(a => a.id !== id));
        }
    };

    const addOrgMember = async (item: Omit<OrgMember, 'id'>) => {
        if (isSupabaseConfigured()) {
            await supabase.from('org_members').insert([item]);
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setOrgMembers(prev => [...prev, newItem]);
        }
    };
    const updateOrgMember = async (id: string, item: Partial<OrgMember>) => {
        if (isSupabaseConfigured()) {
            await supabase.from('org_members').update(item).eq('id', id);
        } else {
            setOrgMembers(prev => prev.map(m => m.id === id ? { ...m, ...item } : m));
        }
    };
    const deleteOrgMember = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('org_members').delete().eq('id', id);
            if (error) throw error;
        } else {
            setOrgMembers(prev => prev.filter(m => m.id !== id));
        }
    };


    const addFaq = async (item: Omit<FAQItem, 'id'>) => {
        if (isSupabaseConfigured()) {
            await supabase.from('faqs').insert([item]);
        } else {
            const newItem = { ...item, id: `local_${Date.now()}` };
            setFaqs(prev => [...prev, newItem]);
        }
    };
    const updateFaq = async (id: string, item: Partial<FAQItem>) => {
        if (isSupabaseConfigured()) {
            await supabase.from('faqs').update(item).eq('id', id);
        } else {
            setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...item } : f));
        }
    };
    const deleteFaq = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from('faqs').delete().eq('id', id);
            if (error) throw error;
        } else {
            setFaqs(prev => prev.filter(f => f.id !== id));
        }
    };

    const addRegistration = async (reg: Omit<Registration, 'id' | 'createdAt'>) => {
        const newReg = {
            ...reg,
            status: 'PAID' as const,
            is_processed: false
        };
        if (isSupabaseConfigured()) {
            // Map camelCase to snake_case
            const dbReg = {
                // If serviceId is 'EVENT' (from generic event registration), set to null to avoid UUID error
                service_id: (newReg.serviceId === 'EVENT' || !newReg.serviceId) ? null : newReg.serviceId,
                service_title: newReg.serviceTitle,
                name: newReg.name,
                phone: newReg.phone,
                birth_year: newReg.birthYear,
                birth_month: newReg.birthMonth,
                birth_day: newReg.birthDay,
                birth_hour: newReg.birthHour,
                city: newReg.city,
                district: newReg.district,
                road: newReg.road,
                address_detail: newReg.addressDetail,
                id_number: newReg.idNumber,
                amount: newReg.amount,
                status: newReg.status,
                is_processed: newReg.is_processed,
                payment_method: newReg.paymentMethod,
                payment_details: newReg.paymentDetails,
                bank_last_five: newReg.bankLastFive
            };
            const { error } = await supabase.from("registrations").insert([dbReg]);
            if (error) {
                console.error("Error adding registration:", error);
                throw error; // Throw error so UI knows it failed
            }
        } else {
            const localReg = { ...newReg, id: `local_${Date.now()}`, createdAt: new Date().toISOString(), isProcessed: false };
            setRegistrations(prev => [localReg, ...prev]);
            console.log("Demo Mode: Registration added locally", localReg);
        }
    };
    const updateRegistration = async (id: string, reg: Partial<Registration>) => {
        if (isSupabaseConfigured()) {
            // This mapping is tedious, simplistic check
            const dbReg: any = { ...reg };
            if (reg.isProcessed !== undefined) { dbReg.is_processed = reg.isProcessed; delete dbReg.isProcessed; }
            // ... add other mappings if editable
            await supabase.from("registrations").update(dbReg).eq('id', id);
        } else {
            setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...reg } : r));
        }
    };
    const deleteRegistration = async (id: string) => {
        if (isSupabaseConfigured()) {
            const { error } = await supabase.from("registrations").delete().eq('id', id);
            if (error) throw error;
        } else {
            setRegistrations(prev => prev.filter(r => r.id !== id));
        }
    };

    const getRegistrationsByPhone = (phone: string) => registrations.filter(r => r.phone === phone);

    // CRITICAL: Update Site Settings
    const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
        if (isSupabaseConfigured()) {
            const dbSettings: any = {};
            // Map keys
            if (newSettings.templeName) dbSettings.temple_name = newSettings.templeName;
            // ... (We should technically map all of them, but user likely updates one by one or few)
            // For robustness, let's map all provided keys
            const map = {
                templeName: 'temple_name', address: 'address', phone: 'phone', lineUrl: 'line_url',
                heroTitle: 'hero_title', heroSubtitle: 'hero_subtitle', heroImage: 'hero_image',
                deityImage: 'deity_image', deityTitle: 'deity_title', deityIntro: 'deity_intro',
                deityBirthday: 'deity_birthday', deityBirthdayLabel: 'deity_birthday_label',
                deityDuty: 'deity_duty', deityDutyLabel: 'deity_duty_label',
                historyImageRoof: 'history_image_roof', historyRoofTitle: 'history_roof_title',
                historyRoofDesc: 'history_roof_desc', historyImageStone: 'history_image_stone',
                historyStoneTitle: 'history_stone_title', historyStoneDesc: 'history_stone_desc',
                historyTitle1: 'history_title1', historyDesc1: 'history_desc1',
                historyTitle2: 'history_title2', historyDesc2: 'history_desc2',
                historyTitle3: 'history_title3', historyDesc3: 'history_desc3',
                configDonation: 'config_donation', configLight: 'config_light', configEvent: 'config_event'
            };
            Object.entries(newSettings).forEach(([k, v]) => {
                if ((map as any)[k]) dbSettings[(map as any)[k]] = v;
            });

            // We assume there is only one row, so we update the first one or a known ID?
            // Usually site_settings table should have a singleton row. 
            // We will try to update where 'id' is not null (unsafe) or just upsert if we knew the ID.
            // Let's fetch the ID first if we don't have it, or just update all rows (hacky but works for singleton)

            // Perform robust Upsert: Check if row exists, then Update or Insert
            const { data: existing, error: fetchError } = await supabase.from('site_settings').select('id').maybeSingle();

            let error;
            if (existing) {
                const { error: updateError } = await supabase.from('site_settings').update(dbSettings).eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('site_settings').insert([dbSettings]);
                error = insertError;
            }

            if (error) {
                console.error("Supabase update settings error:", error);
                throw error;
            }
        } else {
            setSiteSettings(prev => ({ ...prev, ...newSettings }));
        }
    };

    const resetData = async () => {
        if (window.confirm('確定要重置所有資料嗎？(警告：此操作不可逆)')) {
            if (isSupabaseConfigured()) {
                alert('Supabase 重置功能尚未實作 (需刪除所有資料表內容並重新插入)');
                // Implementing full DB reset via client is dangerous and complex without admin role
            } else {
                // Local Reset
                setSiteSettings(DEFAULT_SETTINGS);
                setNews(INITIAL_NEWS);
                setEvents(INITIAL_EVENTS);
                setServices(INITIAL_SERVICES);

                setOrgMembers(INITIAL_ORG);
                setFaqs(INITIAL_FAQS);
                setRegistrations([]);
                setGallery([]);
                alert('已重置預設資料 (演示模式)');
            }
        }
    };

    // === AUTHENTICATION ===
    const [user, setUser] = useState<any>(null); // Supabase User
    const [userProfile, setUserProfile] = useState<any>(null); // Should be UserProfile type, but use any to avoid mismatches for agile dev

    // Check Auth State
    useEffect(() => {
        if (!isSupabaseConfigured()) return;

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            }
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (userId: string) => {
        if (!isSupabaseConfigured()) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Handling case where auth user exists but profile row doesn't (if trigger failed or manual fix needed)
        } else if (data) {
            // Map snake_case to camelCase
            const profile: any = {
                id: data.id,
                email: data.email,
                fullName: data.full_name,
                phone: data.phone,
                birthYear: data.birth_year,
                birthMonth: data.birth_month,
                birthDay: data.birth_day,
                birthHour: data.birth_hour,
                city: data.city,
                district: data.district,
                address: data.address,
                role: data.role,
                createdAt: data.created_at
            };
            setUserProfile(profile);
        }
    };

    const signOut = async () => {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
            alert('您已成功登出');
        } else {
            setUser(null);
            setUserProfile(null);
        }
    };


    return (
        <DataContext.Provider value={{
            news, events, services, gallery, registrations, orgMembers, faqs, siteSettings,
            // Auth
            user, userProfile, signOut, fetchUserProfile,
            addNews, updateNews, deleteNews,
            addEvent, updateEvent, deleteEvent,
            addService, updateService, deleteService,
            addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
            addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum,
            galleryAlbums,
            addOrgMember, updateOrgMember, deleteOrgMember,
            addFaq, updateFaq, deleteFaq,
            addRegistration, updateRegistration, deleteRegistration, getRegistrationsByPhone,

            updateSiteSettings,
            resetData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
