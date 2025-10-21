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