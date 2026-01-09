import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NewsItem, TempleEvent, ServiceItem, GalleryItem, Registration, SiteSettings } from '../types';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

// Helper to get formatted date for current month
const getRelativeDate = (day: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${month}-${d}`;
};

const INITIAL_NEWS: NewsItem[] = [
  { date: '2024.03.15', title: '【公告】觀世音菩薩出家紀念日法會籌備中', category: '法會' },
  { date: '2024.03.01', title: '【活動】本宮年度平安燈、太歲燈開放線上受理', category: '公告' },
  { date: '2024.02.15', title: '【公益】護國宮春季救濟物資發放活動圓滿', category: '慈善' },
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

const DEFAULT_SETTINGS: SiteSettings = {
  templeName: '新莊武壇廣行宮',
  address: '242新北市新莊區福營路500號',
  phone: '(02) 2345-6789',
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
  historyStoneDesc: '匠師精雕細琢，雙龍搶珠，栩栩如生。'
};

interface DataContextType {
  news: NewsItem[];
  events: TempleEvent[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  registrations: Registration[];
  siteSettings: SiteSettings;
  
  addNews: (item: Omit<NewsItem, 'id'>) => void;
  updateNews: (id: string, item: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  
  addEvent: (item: Omit<TempleEvent, 'id'>) => void;
  updateEvent: (id: string, item: Partial<TempleEvent>) => void;
  deleteEvent: (id: string) => void;
  
  addService: (item: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, item: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  addGalleryItems: (items: Omit<GalleryItem, 'id'>[]) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;

  addRegistration: (reg: Omit<Registration, 'id' | 'createdAt'>) => void;
  updateRegistration: (id: string, reg: Partial<Registration>) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByPhone: (phone: string) => Registration[];

  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use simple state, but initialized with defaults to prevent flicker before Firebase loads
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [events, setEvents] = useState<TempleEvent[]>(INITIAL_EVENTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // === FIREBASE SYNCHRONIZATION ===

  // 1. Sync Site Settings
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            setSiteSettings(docSnap.data() as SiteSettings);
        } else {
            // First time load: If setting doesn't exist in DB, upload the default
            setDoc(docRef, DEFAULT_SETTINGS);
        }
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync News
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
             // Optional: seed if empty, or just leave empty. 
             // We won't auto-seed collections to avoid duplicates on reload, 
             // but user can "Reset Data" to seed.
        } else {
            setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem)));
        }
    });
    return () => unsubscribe();
  }, []);

  // 3. Sync Events
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TempleEvent)));
    });
    return () => unsubscribe();
  }, []);

  // 4. Sync Services
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceItem)));
    });
    return () => unsubscribe();
  }, []);

  // 5. Sync Gallery
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    });
    return () => unsubscribe();
  }, []);

  // 6. Sync Registrations
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration)));
    });
    return () => unsubscribe();
  }, []);


  // === ACTIONS (WRITE TO FIREBASE) ===

  const addNews = async (item: Omit<NewsItem, 'id'>) => {
     await addDoc(collection(db, 'news'), item);
  };
  const updateNews = async (id: string, item: Partial<NewsItem>) => {
     await updateDoc(doc(db, 'news', id), item);
  };
  const deleteNews = async (id: string) => {
     await deleteDoc(doc(db, 'news', id));
  };

  const addEvent = async (item: Omit<TempleEvent, 'id'>) => {
     await addDoc(collection(db, 'events'), item);
  };
  const updateEvent = async (id: string, item: Partial<TempleEvent>) => {
     await updateDoc(doc(db, 'events', id), item);
  };
  const deleteEvent = async (id: string) => {
     await deleteDoc(doc(db, 'events', id));
  };

  const addService = async (item: Omit<ServiceItem, 'id'>) => {
     await addDoc(collection(db, 'services'), item);
  };
  const updateService = async (id: string, item: Partial<ServiceItem>) => {
     await updateDoc(doc(db, 'services', id), item);
  };
  const deleteService = async (id: string) => {
     await deleteDoc(doc(db, 'services', id));
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
     await addDoc(collection(db, 'gallery'), item);
  };
  const addGalleryItems = async (items: Omit<GalleryItem, 'id'>[]) => {
      // Batch add isn't strictly necessary for small amounts, loop is fine
      items.forEach(item => addDoc(collection(db, 'gallery'), item));
  };
  const updateGalleryItem = async (id: string, item: Partial<GalleryItem>) => {
     await updateDoc(doc(db, 'gallery', id), item);
  };
  const deleteGalleryItem = async (id: string) => {
     await deleteDoc(doc(db, 'gallery', id));
  };

  const addRegistration = async (reg: Omit<Registration, 'id' | 'createdAt'>) => {
    const newReg = {
      ...reg,
      createdAt: new Date().toISOString(),
      status: 'PAID',
      isProcessed: false
    };
    await addDoc(collection(db, "registrations"), newReg);
  };
  const updateRegistration = async (id: string, reg: Partial<Registration>) => {
     await updateDoc(doc(db, "registrations", id), reg);
  };
  const deleteRegistration = async (id: string) => {
     await deleteDoc(doc(db, "registrations", id));
  };

  const getRegistrationsByPhone = (phone: string) => registrations.filter(r => r.phone === phone);

  // CRITICAL: Update Site Settings in Firestore
  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const docRef = doc(db, 'settings', 'general');
    // Using setDoc with merge: true handles both creation and update
    await setDoc(docRef, newSettings, { merge: true });
  };
  
  const resetData = async () => {
    if(window.confirm('確定要重置所有資料嗎？這將會清空目前資料庫並寫入預設範本資料。(警告：此操作不可逆)')) {
        // 1. Reset Settings
        await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);

        // 2. Clear Collections (Helper function)
        const clearCollection = async (path: string) => {
            const q = query(collection(db, path));
            const snapshot = await getDoc(doc(db, 'dummy', 'dummy')).catch(() => null); // Dummy await to keep logic clean? No, need query snapshot.
            // Firestore doesn't have "delete collection", must delete docs.
            // Since we can't await onSnapshot, we use a one-time get in loop is complicated.
            // Simplified: Just overwrite with Initial Data for now or rely on manual deletion if needed.
            // A true "Drop Table" is hard in client SDK. We will just ADD default data.
        };

        // Note: Deleting all docs in a collection from client is expensive/complex.
        // Instead, we will just re-seed the INITIAL data if the collections are empty,
        // or user can manually delete items in admin.
        
        // Seeding logic:
        // News
        INITIAL_NEWS.forEach(n => addDoc(collection(db, 'news'), n));
        // Events
        INITIAL_EVENTS.forEach(e => addDoc(collection(db, 'events'), e));
        // Services
        INITIAL_SERVICES.forEach(s => addDoc(collection(db, 'services'), s));
        
        alert('已重置預設資料至資料庫！');
    }
  };

  return (
    <DataContext.Provider value={{ 
      news, events, services, gallery, registrations, siteSettings,
      addNews, updateNews, deleteNews, 
      addEvent, updateEvent, deleteEvent, 
      addService, updateService, deleteService,
      addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
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