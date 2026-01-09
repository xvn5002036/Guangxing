import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NewsItem, TempleEvent, ServiceItem, GalleryItem, Registration } from '../types';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

interface DataContextType {
  news: NewsItem[];
  events: TempleEvent[];
  services: ServiceItem[];
  gallery: GalleryItem[];
  registrations: Registration[];
  
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
  
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper for localStorage (Still used for non-critical data)
const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [news, setNews] = usePersistentState<NewsItem[]>('temple_news', INITIAL_NEWS);
  const [events, setEvents] = usePersistentState<TempleEvent[]>('temple_events', INITIAL_EVENTS);
  const [services, setServices] = usePersistentState<ServiceItem[]>('temple_services', INITIAL_SERVICES);
  const [gallery, setGallery] = usePersistentState<GalleryItem[]>('temple_gallery', []);
  
  // Registration data - now handled by Firebase or LocalStorage fallback
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // === FIREBASE INTEGRATION FOR REGISTRATIONS ===
  useEffect(() => {
    if (isFirebaseConfigured()) {
        const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as Registration[];
            setRegistrations(data);
        }, (error) => {
            console.error("Firebase Sync Error:", error);
        });
        return () => unsubscribe();
    } else {
        // Fallback to LocalStorage if no Firebase config
        try {
            const item = window.localStorage.getItem('temple_registrations');
            if (item) setRegistrations(JSON.parse(item));
        } catch (e) { console.error(e); }
    }
  }, []);

  // Update LocalStorage whenever registrations change (ONLY if Firebase is NOT used)
  useEffect(() => {
      if (!isFirebaseConfigured()) {
          window.localStorage.setItem('temple_registrations', JSON.stringify(registrations));
      }
  }, [registrations]);


  const addNews = (item: Omit<NewsItem, 'id'>) => setNews(prev => [{ ...item, id: Date.now().toString() }, ...prev]);
  const updateNews = (id: string, item: Partial<NewsItem>) => setNews(prev => prev.map(n => n.id === id ? { ...n, ...item } : n));
  const deleteNews = (id: string) => setNews(prev => prev.filter(n => n.id !== id));

  const addEvent = (item: Omit<TempleEvent, 'id'>) => setEvents(prev => [...prev, { ...item, id: Date.now().toString() }]);
  const updateEvent = (id: string, item: Partial<TempleEvent>) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const addService = (item: Omit<ServiceItem, 'id'>) => setServices(prev => [...prev, { ...item, id: Date.now().toString() }]);
  const updateService = (id: string, item: Partial<ServiceItem>) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...item } : s));
  const deleteService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => setGallery(prev => [{ ...item, id: Date.now().toString() }, ...prev]);
  const addGalleryItems = (items: Omit<GalleryItem, 'id'>[]) => {
    const newItems = items.map((item, idx) => ({ ...item, id: `${Date.now()}-${idx}` }));
    setGallery(prev => [...newItems, ...prev]);
  };
  const updateGalleryItem = (id: string, item: Partial<GalleryItem>) => setGallery(prev => prev.map(g => g.id === id ? { ...g, ...item } : g));
  const deleteGalleryItem = (id: string) => setGallery(prev => prev.filter(g => g.id !== id));

  // === REGISTRATION ACTIONS (Firebase Aware) ===
  const addRegistration = async (reg: Omit<Registration, 'id' | 'createdAt'>) => {
    const newReg = {
      ...reg,
      createdAt: new Date().toISOString(),
      status: 'PAID',
      isProcessed: false
    };

    if (isFirebaseConfigured()) {
        try {
            await addDoc(collection(db, "registrations"), newReg);
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("雲端連線失敗，請檢查網路");
        }
    } else {
        // Fallback Local
        const localReg = { ...newReg, id: `REG-${Date.now()}` } as Registration;
        setRegistrations(prev => [localReg, ...prev]);
    }
  };

  const updateRegistration = async (id: string, reg: Partial<Registration>) => {
    if (isFirebaseConfigured()) {
        try {
             const docRef = doc(db, "registrations", id);
             await updateDoc(docRef, reg);
        } catch (e) { console.error(e); }
    } else {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, ...reg } : r));
    }
  };

  const deleteRegistration = async (id: string) => {
    if (isFirebaseConfigured()) {
        try {
            await deleteDoc(doc(db, "registrations", id));
        } catch (e) { console.error(e); }
    } else {
        setRegistrations(prev => prev.filter(r => r.id !== id));
    }
  };

  const getRegistrationsByPhone = (phone: string) => registrations.filter(r => r.phone === phone);

  const resetData = () => {
    if(window.confirm('確定要重置所有資料回到預設狀態嗎？這將清除所有新增的內容。(注意：若已連線 Firebase，報名資料需至 Firebase Console 清除)')) {
        setNews(INITIAL_NEWS);
        setEvents(INITIAL_EVENTS);
        setServices(INITIAL_SERVICES);
        setGallery([]);
        if (!isFirebaseConfigured()) {
            setRegistrations([]);
        }
        // Keep other LocalStorage resets
        window.localStorage.removeItem('temple_news');
        window.localStorage.removeItem('temple_events');
        window.localStorage.removeItem('temple_services');
        window.localStorage.removeItem('temple_gallery');
        if (!isFirebaseConfigured()) window.localStorage.removeItem('temple_registrations');
        
        window.location.reload();
    }
  };

  return (
    <DataContext.Provider value={{ 
      news, events, services, gallery, registrations,
      addNews, updateNews, deleteNews, 
      addEvent, updateEvent, deleteEvent, 
      addService, updateService, deleteService,
      addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
      addRegistration, updateRegistration, deleteRegistration, getRegistrationsByPhone,
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