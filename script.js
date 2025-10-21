// --- 全域變數：只宣告，不賦值 ---
let mobileMenuButton, mobileMenu, header, registrationModal, closeModalBtn, registrationForm,
    modalEventTitle, eventNameInput, submitRegBtn, submitBtnText, submitBtnSpinner,
    idNumberGroup, birthdayGroup, addressGroup, idNumberInput, birthdayInput, addressInput,
    resultModal, closeResultModalBtn, resultIconContainer, resultTitle, resultMessage,
    findRegistrationForm, findBtn, findBtnText, findBtnSpinner, cancellationResultArea,
    fortuneModal, closeFortuneModalBtn, shakeButton, shakeLoadingText;

// --- 初始載入和事件監聽 ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM 載入後，才抓取所有元素 ---
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

    // --- 載入資料和設定監聽 ---
    fetchAllData();
    setupEventListeners();
    setupScrollAnimation(); // [重點] 這次保證會被執行到
});

// --- [升級] 更強大的事件監聽設定 ---
function setupEventListeners() {
    
    // 檢查元素是否存在，再綁定事件
    
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
    
    // [修正] 檢查 findRegistrationForm 是否存在
    if (findRegistrationForm) {
        findRegistrationForm.addEventListener('submit', handleFindRegistration);
    }
    
    // [修正] 檢查求籤按鈕是否存在
    if (shakeButton) shakeButton.addEventListener('click', handleFortuneShake);
    if (closeFortuneModalBtn) closeFortuneModalBtn.addEventListener('click', closeFortuneModal);
    if (fortuneModal) fortuneModal.addEventListener('click', (e) => { if (e.target === fortuneModal) closeFortuneModal(); });
}

function fetchAllData() {
    fetchNewsData();
    fetchRegistrableEventsData();
    fetchEventsDataForAlbums(); 
    fetchDeitiesData(); // 載入神明介紹
}

// --- UI：滾動動畫 ---
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
    }, {
        threshold: 0.1 
    });
    animatedElements.forEach(el => observer.observe(el));
}


// --- UI 控制 ---
function toggleMobileMenu() { mobileMenu.classList.toggle('hidden'); }
function handleHeaderScroll() {
    if (header) {
        header.classList.toggle('py-2', window.scrollY > 50);
        header.classList.toggle('py-4', window.scrollY <= 50);
    }
}

// --- 資料獲取與渲染 ---

// 載入神明介紹
async function fetchDeitiesData() {
    const grid = document.getElementById('deities-grid');
    const loadingIndicator = document.getElementById('deities-loading');
    
    // [修正] 檢查元素是否存在
    if (!grid || !loadingIndicator) return; 

    try {
        const response = await fetch('/api/get-deities');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const deities = await response.json();
        
        loadingIndicator.style.display = 'none'; 
        
        if (deities.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有神明介紹資料。</p>';
            return;
        }

        grid.innerHTML = deities.map(deity => `
            <div class="deity-card">
                <img src="${deity.image || 'https://placehold.co/600x400/1e293b/f8fafc?text=神明聖像'}" alt="${deity.name}">
                <div class="deity-card-content">
                    <h3>${deity.name}</h3>
                    <p>${deity.description}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("無法獲取神明介紹:", error);
        loadingIndicator.style.display = 'none';
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入神明介紹，請稍後再試。</p>';
    }
}


// 最新消息
async function fetchNewsData() {
    const swiperWrapper = document.getElementById('news-swiper-wrapper');
    const loadingIndicator = document.getElementById('news-loading');
    
    // [修正] 檢查元素是否存在
    if (!swiperWrapper || !loadingIndicator) return; 

    try {
        const response = await fetch('/api/get-news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsItems = await response.json();
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = newsItems.length === 0 ? `<div class="swiper-slide"><p class="text-slate-500">目前沒有最新消息。</p></div>` : newsItems.map(item => `<div class="swiper-slide"><p class="text-sm text-amber-600 mb-1">${item.date}</p><h3 class="text-xl font-bold text-slate-800 mb-2">${item.title}</h3><p class="text-slate-600 max-w-xl mx-auto">${item.content}</p></div>`).join('');
        new Swiper('.newsSwiper', { loop: newsItems.length > 1, autoplay: { delay: 5000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, });
    } catch (error) { console.error("無法獲取最新消息:", error); loadingIndicator.style.display = 'none'; if (swiperWrapper) swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`; }
}

// 可報名活動
async function fetchRegistrableEventsData() {
    const grid = document.getElementById('registrable-events-grid');
    const loadingIndicator = document.getElementById('registrable-events-loading');
    
    // [修正] 檢查元素是否存在
    if (!grid || !loadingIndicator) return; 

    try {
        const response = await fetch('/api/get-registrable-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        loadingIndicator.style.display = 'none';
        if (events.length === 0) { grid.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有開放報名的活動。</p>'; return; }
        grid.innerHTML = events.map(event => `<div class="grid-item registrable-event-card bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col card-hover"><img src="${event.coverImage || 'https://placehold.co/800x600/e2e8f0/64748b?text=活動主圖'}" alt="${event.title}" class="w-full h-auto object-cover rounded-md mb-4"><div class="flex-grow flex flex-col"><p class="text-sm text-amber-600 mb-1">${event.date}</p><h3 class="text-xl font-bold text-slate-800 mb-2">${event.title}</h3><p class="text-slate-600 text-sm mb-4 flex-grow">${event.description}</p><div class="mt-auto pt-4 border-t border-slate-200"><button class="register-btn w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors" data-event-title="${event.title}" data-require-id="${event.requireID}" data-require-birthday="${event.requireBirthday}" data-require-address="${event.requireAddress}">我要報名</button></div></div></div>`).join('');
        if (typeof Masonry !== 'undefined' && typeof imagesLoaded !== 'undefined') {
            const msnry = new Masonry(grid, { itemSelector: '.grid-item', columnWidth: '.grid-item', percentPosition: true, gutter: 24 });
            imagesLoaded(grid).on('progress', () => msnry.layout());
        }
        document.querySelectorAll('.register-btn').forEach(button => button.addEventListener('click', openRegistrationModal));
    } catch (error) { console.error("無法獲取可報名活動:", error); loadingIndicator.style.display = 'none'; grid.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入可報名活動，請稍後再試。</p>'; }
}


// --- 活動紀實 (相簿功能)
async function fetchEventsDataForAlbums() {
    const albumList = document.getElementById('events-album-list');
    const loadingIndicator = document.getElementById('events-loading');

    // [修正] 檢查元素是否存在
    if (!albumList || !loadingIndicator) return;

    try {
        const response = await fetch('/api/get-events'); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        
        loadingIndicator.style.display = 'none';
        albumList.innerHTML = ''; 
        
        if (events.length === 0) {
            albumList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有活動紀實相簿。</p>';
            return;
        }

        events.forEach(event => {
            if (!event.albumFolder && !event.videoLink) return; 
            
            const albumCard = `
                <div class="album-card card-hover bg-slate-800 rounded-lg shadow-lg overflow-hidden aspect-w-1 aspect-h-1 group" 
                     data-album-folder="${event.albumFolder || ''}" 
                     data-album-title="${event.title}"
                     data-video-link="${event.videoLink || ''}"> 
                    <img src="${event.coverImage || 'https://placehold.co/600x600/e2e8f0/64748b?text=無封面'}" 
                         alt="${event.title}" class="w-full h-full object-cover">
                    <div class="album-overlay flex flex-col justify-end p-6">
                        <p class="text-sm text-amber-400 mb-1">${event.date}</p>
                        <h3 class="text-xl font-bold text-white">${event.title}</h3>
                    </div>
                </div>`;
            albumList.innerHTML += albumCard;
        });

        document.querySelectorAll('.album-card').forEach(card => {
            card.addEventListener('click', openAlbumGallery);
        });

    } catch (error) {
        console.error("無法獲取活動紀實:", error);
        loadingIndicator.style.display = 'none';
        albumList.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入相簿，請稍後再試。</p>';
    }
}

// 開啟相簿燈箱 (支援影片)
async function openAlbumGallery(event) {
    const card = event.currentTarget;
    const folder = card.dataset.albumFolder;
    const title = card.dataset.albumTitle;
    const videoLink = card.dataset.videoLink; 

    if (!folder && !videoLink) {
        showResultModal(false, '錯誤', '找不到相簿或影片資料。');
        return;
    }

    showResultModal('loading', '載入中...', `正在讀取「${title}」的紀實資料...`);

    let dynamicEl = [];

    if (videoLink) {
        dynamicEl.push({
            src: videoLink,
            subHtml: `<h4>${title} - 活動影片</h4>`
        });
    }

    try {
        if (folder) {
            const response = await fetch(`/api/get-album-images?folder=${folder}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '無法從伺服器獲取圖片列表。');
            
            const images = result.images;
            const cloudName = result.cloudName;

            if (images && images.length > 0) {
                const imageElements = images.map(img => {
                    const highQualityUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto/v${img.version}/${img.public_id}.${img.format}`;
                    const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto,f_auto/v${img.version}/${img.public_id}.${img.format}`;
                    return { src: highQualityUrl, thumb: thumbUrl, subHtml: `<h4>${title}</h4>` };
                });
                dynamicEl = dynamicEl.concat(imageElements);
            }
        }

        if (dynamicEl.length === 0) {
            showResultModal(false, '資料為空', `「${title}」中目前沒有照片或影片。`);
            return;
        }
        
        closeResultModal(); 

        const galleryContainer = document.createElement('div');
        const lg = lightGallery(galleryContainer, {
            dynamic: true,
            dynamicEl: dynamicEl,
            plugins: [lgThumbnail, lgVideo], 
            licenseKey: '0000-0000-000-0000', 
        });
        lg.openGallery();

    } catch (error) {
        console.error('開啟相簿失敗:', error);
        showResultModal(false, '開啟相簿失敗', '無法載入照片，請確認 Cloudinary 設定或稍後再試。');
    }
}


// --- 線上求籤 ---
async function handleFortuneShake(event) {
    const button = event.currentTarget;
    if (button.classList.contains('is-shaking')) return; 

    button.classList.add('is-shaking');
    if (shakeLoadingText) shakeLoadingText.textContent = '誠心求籤中...';
    
    try {
        const response = await fetch('/api/get-fortune-slip');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || '求籤失敗');
        }

        document.getElementById('fortune-title').textContent = result.title || '籤詩';
        document.getElementById('fortune-type').textContent = result.type || '平';
        document.getElementById('fortune-poem').textContent = result.poem || '無';
        document.getElementById('fortune-interpretation').textContent = result.interpretation || '無';
        
        openFortuneModal();

    } catch (error) {
        console.error('求籤失敗:', error);
        showResultModal(false, '求籤失敗', `無法取得籤詩，請稍後再試。<br><small>${error.message}</small>`);
    } finally {
        button.classList.remove('is-shaking');
        if (shakeLoadingText) shakeLoadingText.textContent = '';
    }
}

function openFortuneModal() {
    if (fortuneModal) fortuneModal.classList.remove('hidden');
}
function closeFortuneModal() {
    if (fortuneModal) fortuneModal.classList.add('hidden');
}


// --- 報名 Modal ---
function openRegistrationModal(event) {
    const button = event.currentTarget;
    const title = button.dataset.eventTitle;
    if (modalEventTitle) modalEventTitle.textContent = title;
    if (eventNameInput) eventNameInput.value = title;
    
    const fields = { idNumber: 'requireId', birthday: 'requireBirthday', address: 'requireAddress' };
    Object.entries(fields).forEach(([field, dataAttr]) => {
        const required = button.dataset[dataAttr] === 'true';
        const groupEl = document.getElementById(`${field}-group`);
        const inputEl = document.getElementById(field);
        if (groupEl) groupEl.classList.toggle('hidden', !required);
        if (inputEl) inputEl.required = required;
    });
    if (registrationModal) registrationModal.classList.remove('hidden');
}
function closeRegistrationModal() { 
    if (registrationForm) registrationForm.reset(); 
    if (registrationModal) registrationModal.classList.add('hidden');
    [idNumberGroup, birthdayGroup, addressGroup].forEach(el => {
        if (el) el.classList.add('hidden');
    }); 
}
async function handleRegistrationSubmit(event) {
    event.preventDefault();
    setSubmitButtonLoading(true, submitRegBtn, submitBtnText, submitBtnSpinner);
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('/api/submit-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || '發生未知錯誤');
        closeRegistrationModal();
        showResultModal(true, `報名成功！`, `您對「${data.eventName}」的報名已成功送出。您的報名編號為：<strong>${result.registrationId}</strong>。`);
    } catch (error) { console.error('報名失敗:', error); closeRegistrationModal(); showResultModal(false, '報名失敗', `系統似乎發生了一些問題，請稍後再試或直接與本宮聯繫。<br><small>錯誤詳情：${error.message}</small>`); } finally { setSubmitButtonLoading(false, submitRegBtn, submitBtnText, submitBtnSpinner); }
}

// --- 查詢/取消 ---
async function handleFindRegistration(event) {
    event.preventDefault();
    setSubmitButtonLoading(true, findBtn, findBtnText, findBtnSpinner);
    if (cancellationResultArea) {
        cancellationResultArea.innerHTML = '';
        cancellationResultArea.classList.add('hidden');
    }
    const name = document.getElementById('searchName').value;
    const phoneNumber = document.getElementById('searchPhoneNumber').value;
    try {
        const response = await fetch('/api/find-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phoneNumber }), });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        displayCancellationCards(result);
    } catch (error) {
        displayCancellationError(error.message);
    } finally {
        setSubmitButtonLoading(false, findBtn, findBtnText, findBtnSpinner);
    }
}
function displayCancellationCards(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) { displayCancellationError('找不到符合的報名紀錄。請確認您輸入的資料是否正確。'); return; }
    const cardsHTML = dataArray.map(data => { const isCancellable = data.status === 'Confirmed'; const statusClass = data.status === 'Cancelled' ? 'status-cancelled' : 'status-confirmed'; return `<div class="border border-slate-200 rounded-lg p-6 mb-4"><div class="flex justify-between items-start"><div><p class="text-sm text-slate-500">報名活動</p><h4 class="text-xl font-bold text-slate-800">${data.eventName}</h4></div><span class="status-tag ${statusClass}">${data.status === 'Confirmed' ? '已確認' : '已取消'}</span></div><p class="text-sm text-slate-500 mt-2">報名大名：${data.registrantName}</p><p class="text-sm text-slate-500 mt-1">報名編號：${data.registrationId}</p>${isCancellable ? `<div class="mt-6 border-t pt-4"><p class="text-sm text-slate-600 mb-3">若您確定要取消此筆報名，請點擊下方按鈕。此操作無法復原。</p><button class="confirm-cancel-btn w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors" data-page-id="${data.pageId}">確定要取消此筆報名</button></div>` : ''}</div>`; }).join('');
    if (cancellationResultArea) {
        cancellationResultArea.innerHTML = cardsHTML;
        cancellationResultArea.classList.remove('hidden');
    }
    document.querySelectorAll('.confirm-cancel-btn').forEach(button => {
        button.addEventListener('click', handleCancelRegistration);
    });
}
function displayCancellationError(message) { 
    if (cancellationResultArea) {
        cancellationResultArea.innerHTML = `<div class="bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-4">${message}</div>`; 
        cancellationResultArea.classList.remove('hidden'); 
    }
}
async function handleCancelRegistration(event) {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = '取消中...';
    const pageId = button.dataset.pageId;
    if (!pageId || typeof pageId !== 'string' || pageId.trim() === '') {
        showResultModal(false, '取消失敗', '無法讀取報名紀錄 ID，請重新整理頁面後再試。');
        button.disabled = false;
        button.textContent = '確定要取消此筆報名';
        return;
    }
    try {
        const response = await fetch('/api/cancel-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageId: pageId }), });
        const result = await response.json();
        if (!response.ok) { throw new Error(result.message || '後端回傳未知錯誤'); }
        if (findRegistrationForm) findRegistrationForm.dispatchEvent(new Event('submit', { cancelable: true }));
        showResultModal(true, '取消成功', '您的報名紀錄已成功更新為「已取消」。');
    } catch (error) {
        showResultModal(false, '取消失敗', `無法取消您的報名，請稍後再試。<br><small>錯誤詳情：${error.message}</small>`);
        button.disabled = false;
        button.textContent = '確定要取消此筆報名';
    }
}

// --- 通用輔助函數 ---
function setSubmitButtonLoading(isLoading, button, textEl, spinnerEl) {
    if (!button || !textEl || !spinnerEl) return;
    if (isLoading) { textEl.classList.add('hidden'); spinnerEl.classList.remove('hidden'); button.disabled = true; } 
    else { textEl.classList.remove('hidden'); spinnerEl.classList.add('hidden'); button.disabled = false; }
}
function showResultModal(isSuccess, title, message) {
    if (!resultModal) return;
    if (isSuccess === 'loading') {
        if (resultIconContainer) {
            resultIconContainer.innerHTML = `<svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            resultIconContainer.className = 'mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-blue-500';
        }
    } else {
        if (resultIconContainer) {
            resultIconContainer.innerHTML = isSuccess ? `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` : `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            resultIconContainer.className = `mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
        }
    }
    if (resultTitle) resultTitle.textContent = title;
    if (resultMessage) resultMessage.innerHTML = message;
    resultModal.classList.remove('hidden');
}
function closeResultModal() { 
    if (resultModal) resultModal.classList.add('hidden'); 
}