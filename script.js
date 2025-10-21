// --- 全域變數 ---
let mobileMenuButton, mobileMenu, header, registrationModal, closeModalBtn, registrationForm,
    modalEventTitle, eventNameInput, submitRegBtn, submitBtnText, submitBtnSpinner,
    idNumberGroup, birthdayGroup, addressGroup, idNumberInput, birthdayInput, addressInput,
    resultModal, closeResultModalBtn, resultIconContainer, resultTitle, resultMessage,
    findRegistrationForm, findBtn, findBtnText, findBtnSpinner, cancellationResultArea,
    fortuneModal, closeFortuneModalBtn, shakeButton, shakeLoadingText;

// --- 初始載入 ---
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 載入後抓取元素 ---
    mobileMenuButton = document.getElementById('mobile-menu-button');
    mobileMenu = document.getElementById('mobile-menu');
    header = document.getElementById('header');
    registrationModal = document.getElementById('registration-modal');
    closeModalBtn = document.getElementById('close-modal-btn');
    registrationForm = document.getElementById('registration-form');
    modalEventTitle = document.getElementById('modal-event-title');
    eventNameInput = document.getElementById('eventName');
    submitRegBtn = document.getElementById('submit-registration-btn');
    submitBtnText = document.getElementById('submit-btn-text');
    submitBtnSpinner = document.getElementById('submit-btn-spinner');
    idNumberGroup = document.getElementById('idNumber-group');
    birthdayGroup = document.getElementById('birthday-group');
    addressGroup = document.getElementById('address-group');
    idNumberInput = document.getElementById('idNumber');
    birthdayInput = document.getElementById('birthday');
    addressInput = document.getElementById('address');
    resultModal = document.getElementById('result-modal');
    closeResultModalBtn = document.getElementById('close-result-modal-btn');
    resultIconContainer = document.getElementById('result-icon-container');
    resultTitle = document.getElementById('result-title');
    resultMessage = document.getElementById('result-message');
    findRegistrationForm = document.getElementById('find-registration-form');
    findBtn = document.getElementById('find-registration-btn');
    findBtnText = document.getElementById('find-btn-text');
    findBtnSpinner = document.getElementById('find-btn-spinner');
    cancellationResultArea = document.getElementById('cancellation-result-area');
    fortuneModal = document.getElementById('fortune-modal');
    closeFortuneModalBtn = document.getElementById('close-fortune-modal-btn');
    shakeButton = document.getElementById('shake-button');
    shakeLoadingText = document.getElementById('shake-loading-text');

    // --- 載入資料和設定 ---
    fetchAllData();
    setupEventListeners();
    setupScrollAnimation();
});

// --- 事件監聽 ---
function setupEventListeners() {
    if (mobileMenuButton) mobileMenuButton.addEventListener('click', toggleMobileMenu);
    if (mobileMenu) {
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }
    window.addEventListener('scroll', handleHeaderScroll);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeRegistrationModal);
    if (registrationModal) registrationModal.addEventListener('click', (e) => { if (e.target === registrationModal) closeRegistrationModal(); });
    if (registrationForm) registrationForm.addEventListener('submit', handleRegistrationSubmit);
    if (closeResultModalBtn) closeResultModalBtn.addEventListener('click', closeResultModal);
    if (resultModal) resultModal.addEventListener('click', (e) => { if (e.target === resultModal) closeResultModal(); });
    if (findRegistrationForm) findRegistrationForm.addEventListener('submit', handleFindRegistration);
    if (shakeButton) shakeButton.addEventListener('click', handleFortuneShake);
    if (closeFortuneModalBtn) closeFortuneModalBtn.addEventListener('click', closeFortuneModal);
    if (fortuneModal) fortuneModal.addEventListener('click', (e) => { if (e.target === fortuneModal) closeFortuneModal(); });
}

// --- 資料載入 ---
function fetchAllData() {
    fetchNewsData();
    fetchRegistrableEventsData();
    fetchEventsDataForAlbums();
    fetchDeitiesData();
    fetchArticlesData(); // [修改] 呼叫載入文章的函數
	initializeCalendar(); // [新增] 初始化行事曆
}

// --- UI 相關 ---
function setupScrollAnimation() {
     const animatedElements = document.querySelectorAll('.scroll-animate');
     if (!('IntersectionObserver' in window)) {
         animatedElements.forEach(el => el.classList.add('scrolled-in'));
         return;
     }
     const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.classList.add('scrolled-in');
                 observer.unobserve(entry.target);
             }
         });
     }, { threshold: 0.1 });
     animatedElements.forEach(el => observer.observe(el));
 }
function toggleMobileMenu() { if (mobileMenu) mobileMenu.classList.toggle('hidden'); }
function handleHeaderScroll() {
    if (header) {
        header.classList.toggle('py-2', window.scrollY > 50);
        header.classList.toggle('py-4', window.scrollY <= 50);
    }
}

// --- 資料獲取與渲染 ---

// [新增] 載入文章資料
async function fetchArticlesData() {
    const list = document.getElementById('articles-list');
    const loadingIndicator = document.getElementById('articles-loading');
    if (!list || !loadingIndicator) {
        console.warn("Articles list or loading indicator not found."); // 增加提示
        return;
    }

    try {
        const response = await fetch('/api/get-articles'); // 呼叫新的 API
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}, message: ${(await response.json()).message || 'Unknown error'}`);
        const articles = await response.json();

        loadingIndicator.style.display = 'none';

        if (!articles || articles.length === 0) {
            list.innerHTML = '<p class="text-center text-slate-500">目前沒有相關知識文章。</p>';
            return;
        }

        list.innerHTML = articles.map(article => `
            <div class="article-card">
                <h3>${article.title || '無標題'}</h3>
                ${article.publishDate ? `<p class="publish-date">發布日期：${article.publishDate}</p>` : ''}
                <p>${article.content || ''}</p>
            </div>
        `).join('');

    } catch (error) {
        console.error("無法獲取文章資料:", error);
        loadingIndicator.style.display = 'none';
        list.innerHTML = `<p class="text-center text-red-500">無法載入文章，請稍後再試。<br><small>${error.message}</small></p>`; // 顯示錯誤訊息
    }
}

// 載入神明介紹
async function fetchDeitiesData() {
    const grid = document.getElementById('deities-grid');
    const loadingIndicator = document.getElementById('deities-loading');
    if (!grid || !loadingIndicator) return;
    try {
        const response = await fetch('/api/get-deities');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const deities = await response.json();
        loadingIndicator.style.display = 'none';
        if (!deities || deities.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有神明介紹資料。</p>'; return;
        }
        grid.innerHTML = deities.map(deity => `
            <div class="deity-card">
                <img loading="lazy" src="${deity.image || 'https://placehold.co/600x400/1e293b/f8fafc?text=神明聖像'}" alt="${deity.name || ''}">
                <div class="deity-card-content">
                    <h3>${deity.name || '無名'}</h3>
                    <p>${deity.description || ''}</p>
                </div>
            </div>`).join('');
    } catch (error) { /* ...錯誤處理不變... */ }
}

// 最新消息
async function fetchNewsData() {
    const swiperWrapper = document.getElementById('news-swiper-wrapper');
    const loadingIndicator = document.getElementById('news-loading');
    if (!swiperWrapper || !loadingIndicator) return;
    try {
        const response = await fetch('/api/get-news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsItems = await response.json();
        loadingIndicator.style.display = 'none';
        if (!newsItems || newsItems.length === 0) { swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-slate-500">目前沒有最新消息。</p></div>`; return; }
        swiperWrapper.innerHTML = newsItems.map(item => `<div class="swiper-slide"><p class="text-sm text-amber-600 mb-1">${item.date || ''}</p><h3 class="text-xl font-bold text-slate-800 mb-2">${item.title || '無標題'}</h3><p class="text-slate-600 max-w-xl mx-auto">${item.content || ''}</p></div>`).join('');
        if (typeof Swiper !== 'undefined') { new Swiper('.newsSwiper', { loop: newsItems.length > 1, autoplay: { delay: 5000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, }); }
    } catch (error) { /* ...錯誤處理不變... */ }
}

// 可報名活動
async function fetchRegistrableEventsData() {
    const grid = document.getElementById('registrable-events-grid');
    const loadingIndicator = document.getElementById('registrable-events-loading');
    if (!grid || !loadingIndicator) return;
    try {
        const response = await fetch('/api/get-registrable-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        loadingIndicator.style.display = 'none';
        if (!events || events.length === 0) { grid.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有開放報名的活動。</p>'; return; }
        grid.innerHTML = events.map(event => `
            <div class="grid-item registrable-event-card bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col card-hover">
                <img loading="lazy" src="${event.coverImage || 'https://placehold.co/800x600/e2e8f0/64748b?text=活動主圖'}" alt="${event.title || ''}" class="w-full h-auto object-cover rounded-md mb-4">
                <div class="flex-grow flex flex-col">
                    <p class="text-sm text-amber-600 mb-1">${event.date || ''}</p>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">${event.title || '無標題'}</h3>
                    <p class="text-slate-600 text-sm mb-4 flex-grow">${event.description || ''}</p>
                    <div class="mt-auto pt-4 border-t border-slate-200">
                        <button class="register-btn w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors" data-event-title="${event.title || ''}" data-require-id="${event.requireID}" data-require-birthday="${event.requireBirthday}" data-require-address="${event.requireAddress}">我要報名</button>
                    </div>
                </div>
            </div>`).join('');
        if (typeof Masonry !== 'undefined' && typeof imagesLoaded !== 'undefined') {
            const msnry = new Masonry(grid, { itemSelector: '.grid-item', columnWidth: '.grid-item', percentPosition: true, gutter: 24 });
            imagesLoaded(grid).on('progress', () => msnry.layout());
        }
        document.querySelectorAll('.register-btn').forEach(button => button.addEventListener('click', openRegistrationModal));
    } catch (error) { /* ...錯誤處理不變... */ }
}

// 活動紀實 (相簿功能)
async function fetchEventsDataForAlbums() {
    const albumList = document.getElementById('events-album-list');
    const loadingIndicator = document.getElementById('events-loading');
    if (!albumList || !loadingIndicator) return;
    try {
        const response = await fetch('/api/get-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        loadingIndicator.style.display = 'none';
        albumList.innerHTML = '';
        if (!events || events.length === 0) { albumList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有活動紀實相簿。</p>'; return; }
        events.forEach(event => {
            if (!event.albumFolder && !event.videoLink) return;
            const albumCard = `
                <div class="album-card card-hover bg-slate-800 rounded-lg shadow-lg overflow-hidden aspect-w-1 aspect-h-1 group"
                     data-album-folder="${event.albumFolder || ''}" data-album-title="${event.title || ''}" data-video-link="${event.videoLink || ''}">
                    <img loading="lazy" src="${event.coverImage || 'https://placehold.co/600x600/e2e8f0/64748b?text=無封面'}" alt="${event.title || ''}" class="w-full h-full object-cover">
                    <div class="album-overlay flex flex-col justify-end p-6">
                        <p class="text-sm text-amber-400 mb-1">${event.date || ''}</p>
                        <h3 class="text-xl font-bold text-white">${event.title || '無標題'}</h3>
                    </div>
                </div>`;
            albumList.innerHTML += albumCard;
        });
        document.querySelectorAll('.album-card').forEach(card => card.addEventListener('click', openAlbumGallery));
    } catch (error) { /* ...錯誤處理不變... */ }
}

// 開啟相簿燈箱 (支援影片)
async function openAlbumGallery(event) { /* ... 邏輯不變 ... */ }

// 線上求籤
async function handleFortuneShake(event) { /* ... 邏輯不變 ... */ }
function openFortuneModal() { /* ... 邏輯不變 ... */ }
function closeFortuneModal() { /* ... 邏輯不變 ... */ }

// 報名 Modal
function openRegistrationModal(event) { /* ... 邏輯不變 ... */ }
function closeRegistrationModal() { /* ... 邏輯不變 ... */ }
async function handleRegistrationSubmit(event) { /* ... 邏輯不變 ... */ }

// 查詢/取消
async function handleFindRegistration(event) { /* ... 邏輯不變 ... */ }
function displayCancellationCards(dataArray) { /* ... 邏輯不變 ... */ }
function displayCancellationError(message) { /* ... 邏輯不變 ... */ }
async function handleCancelRegistration(event) { /* ... 邏輯不變 ... */ }

// 通用輔助函數
function setSubmitButtonLoading(isLoading, button, textEl, spinnerEl) { /* ... 邏輯不變 ... */ }
function showResultModal(isSuccess, title, message) { /* ... 邏輯不變 ... */ }
function closeResultModal() { /* ... 邏輯不變 ... */ }

// --- [新增] 初始化行事曆 ---
async function initializeCalendar() {
    const calendarEl = document.getElementById('calendar-element');
    const loadingEl = document.getElementById('calendar-loading');
    const errorEl = document.getElementById('calendar-error');

    if (!calendarEl || !loadingEl || !errorEl) {
        console.error("Calendar elements not found.");
        return;
    }

    try {
        const response = await fetch('/api/get-calendar-events'); // 呼叫新的 API
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${(await response.json()).message || 'Unknown error'}`);
        }
        const events = await response.json();

        loadingEl.style.display = 'none';
        calendarEl.style.display = 'block';

        // --- 初始化 FullCalendar ---
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth', // 預設月視圖
            locale: 'zh-tw', // 設定繁體中文
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek' // 提供不同視圖切換
            },
            buttonText: { // 中文化按鈕文字
                today: '今天',
                month: '月',
                week: '週',
                list: '列表'
            },
            events: events, // 將從 API 取得的事件放入
            eventDidMount: function(info) {
                // [新增] 滑鼠移入事件，顯示 Tooltip
                if (info.event.extendedProps.description) {
                    info.el.addEventListener('mouseenter', (e) => showTooltip(e, info.event.extendedProps.description));
                    info.el.addEventListener('mouseleave', hideTooltip);
                }
            },
            // eventClick: function(info) { // 可選：點擊事件跳出詳細 Modal
            //     alert('活動: ' + info.event.title + '\n簡介: ' + (info.event.extendedProps.description || '無'));
            //     info.jsEvent.preventDefault(); // prevent browser navigation
            // }
        });

        calendar.render(); // 渲染行事曆

    } catch (error) {
        console.error("無法初始化行事曆:", error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block'; // 顯示錯誤訊息
    }
}

// --- [新增] Tooltip 相關函數 ---
let tooltipElement = null;

function showTooltip(mouseEvent, text) {
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'event-tooltip';
        document.body.appendChild(tooltipElement);
    }
    tooltipElement.textContent = text;
    tooltipElement.style.display = 'block';
    // 計算 Tooltip 位置
    positionTooltip(mouseEvent);
    // 持續更新位置以防事件元素移動
    mouseEvent.target.addEventListener('mousemove', positionTooltip);
}

function hideTooltip(mouseEvent) {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
     // 移除移動監聽
    mouseEvent.target.removeEventListener('mousemove', positionTooltip);
}

function positionTooltip(mouseEvent) {
     if (!tooltipElement) return;
     // 簡單定位在滑鼠右下方，可再優化邊界判斷
     const x = mouseEvent.clientX + 10;
     const y = mouseEvent.clientY + 10;
     tooltipElement.style.left = `${x}px`;
     tooltipElement.style.top = `${y}px`;
}


// --- 其他函數 (fetchDeitiesData, fetchNewsData 等...) 保持不變 ---
// ...
// ... (所有舊的函數)
// ...