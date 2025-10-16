import { Client } from '@notionhq/client';
import Head from 'next/head';
import { MapPin, Clock, Phone, Sparkles, ChevronsRight, Annoyed } from 'lucide-react';

// --- 1. Notion API 處理函式 ---
// 初始化 Notion 客戶端
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 從 Notion 回應中安全地提取文字內容
const getText = (richTextArray) => {
  return richTextArray?.[0]?.plain_text || '';
};

// 從 Notion 回應中安全地提取檔案 URL
const getFileUrl = (filesArray) => {
  if (filesArray && filesArray.length > 0) {
    if (filesArray[0].type === 'file') {
      return filesArray[0].file.url;
    }
    if (filesArray[0].type === 'external') {
      return filesArray[0].external.url;
    }
  }
  return null;
};

// --- 2. 頁面元件 (React Components) ---

// 頁首導覽列
const Header = () => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-md">
    <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
      <a href="#" className="text-2xl font-bold text-[#8B0000]">新莊武壇廣行宮</a>
      <div className="hidden md:flex space-x-8 items-center">
        <a href="#about" className="hover:text-[#b8860b] transition-colors duration-300">關於本宮</a>
        <a href="#deity" className="hover:text-[#b8860b] transition-colors duration-300">神明介紹</a>
        <a href="#news" className="hover:text-[#b8860b] transition-colors duration-300">最新消息</a>
        <a href="#services" className="hover:text-[#b8860b] transition-colors duration-300">服務項目</a>
        <a href="#contact" className="bg-[#8B0000] text-white py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300">聯絡我們</a>
      </div>
       {/* 手機版的選單按鈕，目前未加上功能 */}
      <button className="md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
    </nav>
  </header>
);

// 主視覺區塊
const Hero = () => (
  <section className="relative h-[60vh] bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1594225123992-1995a452144b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}>
    <div className="absolute inset-0 bg-black/50"></div>
    <div className="relative z-10 text-center space-y-4">
      <h1 className="text-4xl md:text-6xl font-bold tracking-wider">新莊武壇廣行宮</h1>
      <p className="text-xl md:text-2xl font-medium">主祀 池府王爺</p>
    </div>
  </section>
);

// 關於本宮
const About = () => (
  <section id="about" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#8B0000]">關於本宮</h2>
        <div className="w-24 h-1 bg-[#b8860b] mx-auto mt-2"></div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2">
          <img src="https://images.unsplash.com/photo-1622383803201-424f54e24029?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="宮廟外觀" className="rounded-lg shadow-xl w-full" />
        </div>
        <div className="md:w-1/2 space-y-4 text-lg text-gray-600">
          <p>新莊武壇廣行宮，座落於新北市新莊區，為地方重要之信仰中心。本宮歷史悠久，香火鼎盛，主祀池府王爺，神威顯赫，護佑鄉里，深得十方善信敬仰。</p>
          <p>自建宮以來，我們秉持神明慈悲濟世之精神，致力於發揚傳統宗教文化，並積極參與社會公益，期能安定人心，教化良善，為社會注入祥和之氣。宮內建築莊嚴典雅，木石雕刻皆出自名匠之手，展現了傳統工藝之美，亦是信眾沉澱心靈、尋求慰藉之清靜地。</p>
        </div>
      </div>
    </div>
  </section>
);

// 神明介紹
const Deities = ({ deities }) => (
    <section id="deity" className="py-20 bg-[#f8f6f1]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-[#8B0000]">神明介紹</h2>
            <div className="w-24 h-1 bg-[#b8860b] mx-auto mt-2"></div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {deities.map((deity) => (
                    <div key={deity.id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
                         <img src={deity.imageUrl || 'https://placehold.co/400x400/b8860b/FFFFFF?text=聖像'} alt={deity.name} className="w-48 h-48 object-cover rounded-full shadow-md mb-4 border-4 border-[#b8860b]" />
                        <h3 className="text-2xl font-bold text-[#b8860b]">{deity.name}</h3>
                        <p className="text-gray-600 mt-2">{deity.introduction}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// 最新消息
const News = ({ news }) => (
  <section id="news" className="py-20 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#8B0000]">最新消息</h2>
        <div className="w-24 h-1 bg-[#b8860b] mx-auto mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
            <img src={item.imageUrl || 'https://placehold.co/600x400/8B0000/FFFFFF?text=活動'} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">{item.date}</p>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4 h-24 overflow-hidden">{item.summary}</p>
              <a href="#" className="text-[#b8860b] font-semibold hover:underline flex items-center">閱讀更多 <ChevronsRight size={20} /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// 服務項目
const Services = ({ services }) => (
    <section id="services" className="py-20 bg-[#f8f6f1]">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#8B0000]">服務項目</h2>
                <div className="w-24 h-1 bg-[#b8860b] mx-auto mt-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center">
                        <div className="bg-[#b8860b] p-4 rounded-full mb-4">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-[#8B0000] mb-2">{service.name}</h3>
                        <p className="text-gray-600 flex-grow">{service.description}</p>
                         <p className="text-gray-800 font-bold mt-4">{service.price}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// 聯絡資訊
const Contact = () => (
  <section id="contact" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#8B0000]">聯絡我們</h2>
        <div className="w-24 h-1 bg-[#b8860b] mx-auto mt-2"></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="lg:w-1/2 space-y-6">
          <div className="flex items-start gap-4">
            <MapPin size={24} className="text-[#b8860b] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#b8860b]">宮廟地址</h3>
              <p className="text-gray-600 mt-1 text-lg">242新北市新莊區福營路500號</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock size={24} className="text-[#b8860b] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#b8860b]">開放時間</h3>
              <p className="text-gray-600 mt-1 text-lg">每日上午 6:00 至 晚上 9:00</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone size={24} className="text-[#b8860b] mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#b8860b]">聯絡電話</h3>
              <p className="text-gray-600 mt-1 text-lg">(02) 1234-5678 (此為範例號碼)</p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.143249058692!2d121.4309349759368!3d25.029232377820128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a7da931e9ba5%3A0x629533d7b3ab584e!2zMjQy5paw5YyX5biC5paw6I6K5Y2A56aP55S16LevNTAw6Jmf!5e0!3m2!1szh-TW!2stw!4v1729088654877!5m2!1szh-TW!2stw" 
            width="100%" height="100%" style={{ border:0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  </section>
);

// 頁尾
const Footer = () => (
  <footer className="bg-[#8B0000] text-white">
    <div className="container mx-auto px-6 py-8 text-center">
      <p>&copy; 2025 新莊武壇廣行宮. All Rights Reserved.</p>
      <p className="text-sm text-gray-300 mt-2">版面設計與程式碼由 Gemini 生成</p>
    </div>
  </footer>
);

// 錯誤訊息提示
const ErrorDisplay = ({ message }) => (
    <div className="container mx-auto px-6 py-12 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <div className="flex justify-center items-center gap-4">
            <Annoyed size={40} />
            <div>
                <h3 className="font-bold text-xl">糟糕，發生錯誤！</h3>
                <p className="mt-2">{message}</p>
                <p className="text-sm mt-1">請檢查 Vercel 後台的環境變數是否已正確設定。</p>
            </div>
        </div>
    </div>
);


// --- 3. 網站主頁面 ---
export default function HomePage({ news, deities, services, error }) {
    if (error) {
        return <ErrorDisplay message={error} />;
    }

  return (
    <div className="bg-[#f8f6f1] antialiased text-gray-800">
      <Head>
        <title>新莊武壇廣行宮</title>
        <meta name="description" content="新莊武壇廣行宮，主祀池府王爺。提供信眾參拜、問事、安太歲、點光明燈等服務。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main>
        <Hero />
        <About />
        <Deities deities={deities} />
        <News news={news} />
        <Services services={services} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}


// --- 4. 從 Notion 獲取資料的伺服器端邏輯 (Server-Side) ---
// 這段程式碼會在伺服器端 (Vercel) 執行，
// 在使用者看到頁面前，就先從 Notion 把資料抓好。

export async function getServerSideProps() {
  try {
    // 檢查環境變數是否存在
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_NEWS_DB_ID || !process.env.NOTION_DEITIES_DB_ID || !process.env.NOTION_SERVICES_DB_ID) {
        throw new Error("缺少必要的 Notion 環境變數設定。");
    }

    // --- 獲取最新消息 ---
    const newsResponse = await notion.databases.query({
      database_id: process.env.NOTION_NEWS_DB_ID,
      filter: { property: "狀態", status: { equals: "已發布" } },
      sorts: [{ property: "發布日期", direction: "descending" }],
    });
    const news = newsResponse.results.map(page => ({
      id: page.id,
      title: getText(page.properties.標題?.title),
      summary: getText(page.properties.內容摘要?.rich_text),
      date: page.properties.發布日期?.date?.start || '無日期',
      imageUrl: getFileUrl(page.properties.封面圖片?.files),
    }));

    // --- 獲取神明介紹 ---
    const deitiesResponse = await notion.databases.query({
      database_id: process.env.NOTION_DEITIES_DB_ID,
       sorts: [{ property: "排序", direction: "ascending" }],
    });
    const deities = deitiesResponse.results.map(page => ({
        id: page.id,
        name: getText(page.properties.神明聖號?.title),
        introduction: getText(page.properties.神明介紹?.rich_text),
        imageUrl: getFileUrl(page.properties.神像照片?.files),
    }));

    // --- 獲取服務項目 ---
    const servicesResponse = await notion.databases.query({
        database_id: process.env.NOTION_SERVICES_DB_ID,
        sorts: [{ property: "排序", direction: "ascending" }],
    });
    const services = servicesResponse.results.map(page => ({
        id: page.id,
        name: getText(page.properties.服務名稱?.title),
        description: getText(page.properties.服務說明?.rich_text),
        price: getText(page.properties.費用?.rich_text),
    }));

    return {
      props: { news, deities, services, error: null },
    };

  } catch (err) {
    console.error("無法從 Notion 獲取資料:", err.message);
    // 將錯誤訊息傳遞到前端頁面
    return {
      props: {
        news: [],
        deities: [],
        services: [],
        error: `無法從 Notion 獲取資料。請檢查您的 API 金鑰與資料庫 ID 是否正確。錯誤詳情: ${err.message}`
      }
    };
  }
}
