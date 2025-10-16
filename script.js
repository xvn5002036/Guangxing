// --- 等待 HTML 完整載入後才執行 ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 手機版選單開關 ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

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

    // --- 執行所有資料抓取 ---
    fetchNewsData(); 
    fetchRegistrableEventsData();
    fetchPastEventsData();
    setupRegistrationModal();
});


// --- 抓取「最新消息」資料並初始化輪播 ---
async function fetchNewsData() {
    const swiperWrapper = document.getElementById('news-swiper-wrapper');
    const loadingIndicator = document.getElementById('news-loading');
    
    try {
        const response = await fetch('/api/get-news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsItems = await response.json();

        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = ''; 

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
       
        const newsSwiper = new Swiper('.newsSwiper', {
            loop: newsItems.length > 1,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
        });

    } catch (error) {
        console.error("Failed to fetch news data:", error);
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`;
    }
}

// --- NEW: 抓取「可報名活動」資料 ---
async function fetchRegistrableEventsData() {
    const eventsList = document.getElementById('registrable-events-list');
    const loadingIndicator = document.getElementById('reg-events-loading');
    try {
        const response = await fetch('/api/get-registrable-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = ''; 
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p class="text-center text-slate-500">目前沒有開放報名的活動。</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = `
                <div class="event-card bg-slate-50 p-6 rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img src="${event.coverImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=無圖片'}" alt="${event.eventName}" class="w-full h-auto object-cover rounded-md mb-4">
                    <div class="flex-grow">
                        <p class="text-sm text-amber-600 mb-1">${event.eventDate}</p>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">${event.eventName}</h3>
                        <p class="text-slate-600 text-sm mb-4">${event.description}</p>
                        <p class="text-sm font-bold text-slate-500">名額上限：${event.maxAttendees} 人</p>
                    </div>
                    <button data-event-name="${event.eventName}" class="register-btn mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        立即報名
                    </button>
                </div>`;
            eventsList.innerHTML += eventCard;
        });
    } catch (error) {
        console.error("Failed to fetch registrable events data:", error);
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '<p class="text-center text-red-500">無法載入可報名活動，請稍後再試。</p>';
    }
}

// --- 抓取「活動紀實」(過去活動) 資料 ---
async function fetchPastEventsData() {
    const eventsList = document.getElementById('events-list');
    const loadingIndicator = document.getElementById('events-loading');
    try {
        const response = await fetch('/api/get-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '';
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有過往活動紀錄。</p>';
            return;
        }

        events.forEach(event => {
            const eventCard = `
                <div class="bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col">
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
        console.error("Failed to fetch past events data:", error);
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入活動紀實，請稍後再試。</p>';
    }
}

// --- NEW: 設定報名彈出視窗 (Modal) 的所有功能 ---
function setupRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const eventNameInput = document.getElementById('event-name-input');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');

    const modalResult = document.getElementById('modal-result');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultOkBtn = document.getElementById('result-ok-btn');

    // 使用事件委派來監聽所有「立即報名」按鈕的點擊
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('register-btn')) {
            const eventName = e.target.getAttribute('data-event-name');
            eventNameInput.value = eventName;
            modalTitle.textContent = `報名：${eventName}`;
            showModal();
        }
    });

    function showModal() {
        // Reset to form view
        form.style.display = 'block';
        modalResult.style.display = 'none';
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = '確認送出';

        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('opacity-0', '-translate-y-10');
        }, 10);
    }

    function hideModal() {
        modalContent.classList.add('opacity-0', '-translate-y-10');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    closeModalBtn.addEventListener('click', hideModal);
    resultOkBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = '報名資料送出中...';

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/submit-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || '發生未知錯誤');
            }
            
            showResultView(true, '報名成功！', `您的報名編號是：<strong>${result.registrationId}</strong><br>請妥善保管此編號，以便日後查詢或取消。`);

        } catch (error) {
            console.error('Registration failed:', error);
            showResultView(false, '報名失敗', error.message);
        }
    });

    function showResultView(isSuccess, title, message) {
        form.style.display = 'none';
        modalResult.style.display = 'block';

        resultIcon.innerHTML = isSuccess 
            ? `<svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
            : `<svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

        resultTitle.textContent = title;
        resultMessage.innerHTML = message;
    }
}


