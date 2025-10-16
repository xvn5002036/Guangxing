// --- 等待 HTML 完整載入後才執行 ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 手機版選單開關 ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 點擊手機版選單連結後，自動收合選單
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    // --- 導覽列滾動背景變化 ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('py-2');
            header.classList.remove('py-4');
        } else {
            header.classList.add('py-4');
            header.classList.remove('py-2');
        }
    });

    // --- 執行資料抓取 ---
    fetchEventsData();
    fetchNewsData(); 
});


// --- 抓取「活動紀實」資料 ---
async function fetchEventsData() {
    const eventsList = document.getElementById('events-list');
    const loadingIndicator = document.getElementById('events-loading');
    try {
        const response = await fetch('/api/get-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = ''; // 清空載入中圖示
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有新的活動公告。</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = `
                <div class="card-hover bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img src="${event.coverImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=無圖片'}" alt="${event.title}" class="w-full h-40 object-cover rounded-md mb-4">
                    <div class="flex-grow">
                        <p class="text-sm text-amber-600 mb-1">${event.date}</p>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">${event.title}</h3>
                        <p class="text-slate-600 text-sm">${event.summary}</p>
                    </div>
                </div>`;
            eventsList.innerHTML += eventCard;
        });
    } catch (error) {
        console.error("Failed to fetch events data:", error);
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入活動資訊，請稍後再試。</p>';
    }
}

// --- 抓取「最新消息」資料並初始化輪播 ---
async function fetchNewsData() {
    const swiperWrapper = document.getElementById('news-swiper-wrapper');
    const loadingIndicator = document.getElementById('news-loading');
    
    try {
        const response = await fetch('/api/get-news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsItems = await response.json();

        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = ''; // 清空載-入中圖示

        if (newsItems.length === 0) {
            swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-slate-500">目前沒有最新消息。</p></div>`;
        } else {
             newsItems.forEach(item => {
                const newsSlideHTML = `
                    <div class="swiper-slide">
                        <p class="text-sm text-amber-600 mb-1">${item.date}</p>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">${item.title}</h3>
                        <p class="text-slate-600 max-w-xl mx-auto">${item.content}</p>
                    </div>`;
                swiperWrapper.innerHTML += newsSlideHTML;
            });
        }
       
        // 等待 DOM 更新後，再初始化 Swiper
        const newsSwiper = new Swiper('.newsSwiper', {
            loop: newsItems.length > 1,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

    } catch (error) {
        console.error("Failed to fetch news data:", error);
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`;
    }
}
