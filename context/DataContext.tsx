
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NewsItem, TempleEvent, ServiceItem, GalleryItem, Registration, SiteSettings, OrgMember } from '../types';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

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
  historyStoneDesc: '匠師精雕細琢，雙龍搶珠，栩栩如生。'
};

interface DataContextType {
  news: NewsItem[];
  events: TempleEvent[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  registrations: Registration[];
  orgMembers: OrgMember[];
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

  addOrgMember: (item: Omit<OrgMember, 'id'>) => void;
  updateOrgMember: (id: string, item: Partial<OrgMember>) => void;
  deleteOrgMember: (id: string) => void;

  addRegistration: (reg: Omit<Registration, 'id' | 'createdAt'>) => void;
  updateRegistration: (id: string, reg: Partial<Registration>) => void;
  deleteRegistration: (id: string) => void;
  getRegistrationsByPhone: (phone: string) => Registration[];

  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use simple state, initialized with defaults
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [events, setEvents] = useState<TempleEvent[]>(INITIAL_EVENTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>(INITIAL_ORG);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // === FIREBASE SYNCHRONIZATION ===

  // 1. Sync Site Settings
  useEffect(() => {
    if (!db) return; // Guard clause for missing DB
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
    if (!db) return;
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem)));
        }
    });
    return () => unsubscribe();
  }, []);

  // 3. Sync Events
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TempleEvent)));
    });
    return () => unsubscribe();
  }, []);

  // 4. Sync Services
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceItem)));
    });
    return () => unsubscribe();
  }, []);

  // 5. Sync Gallery
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'gallery'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setGallery(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem)));
    });
    return () => unsubscribe();
  }, []);

  // 6. Sync Org Members
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'org_members'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrgMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrgMember)));
    });
    return () => unsubscribe();
  }, []);

  // 7. Sync Registrations
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration)));
    });
    return () => unsubscribe();
  }, []);


  // === ACTIONS (WRITE TO FIREBASE OR LOCAL STATE) ===
  // All actions now check for db existence. If db is null (no API key), they update local state for Demo purposes.

  const addNews = async (item: Omit<NewsItem, 'id'>) => {
     if (db) {
         await addDoc(collection(db, 'news'), item);
     } else {
         const newItem = { ...item, id: `local_${Date.now()}` };
         setNews(prev => [newItem, ...prev]);
     }
  };
  const updateNews = async (id: string, item: Partial<NewsItem>) => {
     if (db) {
         await updateDoc(doc(db, 'news', id), item);
     } else {
         setNews(prev => prev.map(n => n.id === id ? { ...n, ...item } : n));
     }
  };
  const deleteNews = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, 'news', id));
     } else {
         setNews(prev => prev.filter(n => n.id !== id));
     }
  };

  const addEvent = async (item: Omit<TempleEvent, 'id'>) => {
     if (db) {
         await addDoc(collection(db, 'events'), item);
     } else {
         const newItem = { ...item, id: `local_${Date.now()}` };
         setEvents(prev => [...prev, newItem].sort((a,b) => a.date.localeCompare(b.date)));
     }
  };
  const updateEvent = async (id: string, item: Partial<TempleEvent>) => {
     if (db) {
         await updateDoc(doc(db, 'events', id), item);
     } else {
         setEvents(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
     }
  };
  const deleteEvent = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, 'events', id));
     } else {
         setEvents(prev => prev.filter(e => e.id !== id));
     }
  };

  const addService = async (item: Omit<ServiceItem, 'id'>) => {
     if (db) {
         await addDoc(collection(db, 'services'), item);
     } else {
         const newItem = { ...item, id: `local_${Date.now()}` };
         setServices(prev => [...prev, newItem]);
     }
  };
  const updateService = async (id: string, item: Partial<ServiceItem>) => {
     if (db) {
         await updateDoc(doc(db, 'services', id), item);
     } else {
         setServices(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
     }
  };
  const deleteService = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, 'services', id));
     } else {
         setServices(prev => prev.filter(s => s.id !== id));
     }
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id'>) => {
     if (db) {
         await addDoc(collection(db, 'gallery'), item);
     } else {
         const newItem = { ...item, id: `local_${Date.now()}` };
         setGallery(prev => [...prev, newItem]);
     }
  };
  const addGalleryItems = async (items: Omit<GalleryItem, 'id'>[]) => {
      if (db) {
          items.forEach(item => addDoc(collection(db, 'gallery'), item));
      } else {
          const newItems = items.map((item, i) => ({ ...item, id: `local_${Date.now()}_${i}` }));
          setGallery(prev => [...prev, ...newItems]);
      }
  };
  const updateGalleryItem = async (id: string, item: Partial<GalleryItem>) => {
     if (db) {
         await updateDoc(doc(db, 'gallery', id), item);
     } else {
         setGallery(prev => prev.map(g => g.id === id ? { ...g, ...item } : g));
     }
  };
  const deleteGalleryItem = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, 'gallery', id));
     } else {
         setGallery(prev => prev.filter(g => g.id !== id));
     }
  };

  const addOrgMember = async (item: Omit<OrgMember, 'id'>) => {
     if (db) {
         await addDoc(collection(db, 'org_members'), item);
     } else {
         const newItem = { ...item, id: `local_${Date.now()}` };
         setOrgMembers(prev => [...prev, newItem]);
     }
  };
  const updateOrgMember = async (id: string, item: Partial<OrgMember>) => {
     if (db) {
         await updateDoc(doc(db, 'org_members', id), item);
     } else {
         setOrgMembers(prev => prev.map(m => m.id === id ? { ...m, ...item } : m));
     }
  };
  const deleteOrgMember = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, 'org_members', id));
     } else {
         setOrgMembers(prev => prev.filter(m => m.id !== id));
     }
  };

  const addRegistration = async (reg: Omit<Registration, 'id' | 'createdAt'>) => {
    const newReg = {
      ...reg,
      createdAt: new Date().toISOString(),
      status: 'PAID' as const,
      isProcessed: false
    };
    if (db) {
        await addDoc(collection(db, "registrations"), newReg);
    } else {
        // DEMO MODE: Update local state to simulate successful payment
        const localReg = { ...newReg, id: `local_${Date.now()}` };
        setRegistrations(prev => [localReg, ...prev]);
        console.log("Demo Mode: Registration added locally", localReg);
    }
  };
  const updateRegistration = async (id: string, reg: Partial<Registration>) => {
     if (db) {
         await updateDoc(doc(db, "registrations", id), reg);
     } else {
         setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...reg } : r));
     }
  };
  const deleteRegistration = async (id: string) => {
     if (db) {
         await deleteDoc(doc(db, "registrations", id));
     } else {
         setRegistrations(prev => prev.filter(r => r.id !== id));
     }
  };

  const getRegistrationsByPhone = (phone: string) => registrations.filter(r => r.phone === phone);

  // CRITICAL: Update Site Settings in Firestore or Local
  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    if (db) {
        const docRef = doc(db, 'settings', 'general');
        await setDoc(docRef, newSettings, { merge: true });
    } else {
        setSiteSettings(prev => ({ ...prev, ...newSettings }));
    }
  };
  
  const resetData = async () => {
    if(window.confirm('確定要重置所有資料嗎？這將會清空目前資料庫並寫入預設範本資料。(警告：此操作不可逆)')) {
        if (db) {
            await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS);
            // Seeding logic (Simplified for demo, usually you'd delete old collections first)
            INITIAL_NEWS.forEach(n => addDoc(collection(db, 'news'), n));
            INITIAL_EVENTS.forEach(e => addDoc(collection(db, 'events'), e));
            INITIAL_SERVICES.forEach(s => addDoc(collection(db, 'services'), s));
            INITIAL_ORG.forEach(o => addDoc(collection(db, 'org_members'), o));
            alert('已重置預設資料至資料庫！');
        } else {
            // Local Reset
            setSiteSettings(DEFAULT_SETTINGS);
            setNews(INITIAL_NEWS);
            setEvents(INITIAL_EVENTS);
            setServices(INITIAL_SERVICES);
            setOrgMembers(INITIAL_ORG);
            setRegistrations([]);
            setGallery([]);
            alert('已重置預設資料 (演示模式：重新整理後將失效)');
        }
    }
  };

  return (
    <DataContext.Provider value={{ 
      news, events, services, gallery, registrations, orgMembers, siteSettings,
      addNews, updateNews, deleteNews, 
      addEvent, updateEvent, deleteEvent, 
      addService, updateService, deleteService,
      addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
      addOrgMember, updateOrgMember, deleteOrgMember,
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
