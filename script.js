// --- 全域變數和 DOM 元素 ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.getElementById('header');

// Registration Modal
const registrationModal = document.getElementById('registration-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const registrationForm = document.getElementById('registration-form');
const modalEventTitle = document.getElementById('modal-event-title');
const eventNameInput = document.getElementById('eventName');
const submitRegBtn = document.getElementById('submit-registration-btn');
const submitBtnText = document.getElementById('submit-btn-text');
const submitBtnSpinner = document.getElementById('submit-btn-spinner');

// Dynamic Registration Fields
const idNumberGroup = document.getElementById('idNumber-group');
const birthdayGroup = document.getElementById('birthday-group');
const addressGroup = document.getElementById('address-group');
const idNumberInput = document.getElementById('idNumber');
const birthdayInput = document.getElementById('birthday');
const addressInput = document.getElementById('address');

// Result Modal
const resultModal = document.getElementById('result-modal');
const closeResultModalBtn = document.getElementById('close-result-modal-btn');
const resultIconContainer = document.getElementById('result-icon-container');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');

// Cancellation Form & Result Area
const findRegistrationForm = document.getElementById('find-registration-form');
const findBtn = document.getElementById('find-registration-btn');
const findBtnText = document.getElementById('find-btn-text');
const findBtnSpinner = document.getElementById('find-btn-spinner');
const cancellationResultArea = document.getElementById('cancellation-result-area');


// --- 初始載入和事件監聽 ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    setupEventListeners();
});

function setupEventListeners() {
    // Mobile Menu
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    // Header Scroll Effect
    window.addEventListener('scroll', handleHeaderScroll);

    // Registration Modal
    closeModalBtn.addEventListener('click', closeRegistrationModal);
    registrationModal.addEventListener('click', (e) => { if (e.target === registrationModal) closeRegistrationModal(); });
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
    
    // Result Modal
    closeResultModalBtn.addEventListener('click', closeResultModal);
    resultModal.addEventListener('click', (e) => { if (e.target === resultModal) closeResultModal(); });

    // Cancellation Form
    findRegistrationForm.addEventListener('submit', handleFindRegistration);
}

function fetchAllData() {
    fetchNewsData();
    fetchRegistrableEventsData();
    fetchEventsData();
}

// --- UI 控制 ---
function toggleMobileMenu() { mobileMenu.classList.toggle('hidden'); }
function handleHeaderScroll() {
    header.classList.toggle('py-2', window.scrollY > 50);
    header.classList.toggle('py-4', window.scrollY <= 50);
}

// --- 資料獲取與渲染 ---

async function fetchNewsData() {
    const swiperWrapper = document.getElementById('news-swiper-wrapper');
    const loadingIndicator = document.getElementById('news-loading');
    try {
        const response = await fetch('/api/get-news');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const newsItems = await response.json();
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = newsItems.length === 0
            ? `<div class="swiper-slide"><p class="text-slate-500">目前沒有最新消息。</p></div>`
            : newsItems.map(item => `
                <div class="swiper-slide">
                    <p class="text-sm text-amber-600 mb-1">${item.date}</p>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">${item.title}</h3>
                    <p class="text-slate-600 max-w-xl mx-auto">${item.content}</p>
                </div>`).join('');
        new Swiper('.newsSwiper', {
            loop: newsItems.length > 1,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
        });
    } catch (error) {
        console.error("無法獲取最新消息:", error);
        loadingIndicator.style.display = 'none';
        if (swiperWrapper) swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`;
    }
}

async function fetchRegistrableEventsData() {
    const grid = document.getElementById('registrable-events-grid');
    const loadingIndicator = document.getElementById('registrable-events-loading');
    try {
        const response = await fetch('/api/get-registrable-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        loadingIndicator.style.display = 'none';
        if (events.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有開放報名的活動。</p>';
            return;
        }
        grid.innerHTML = events.map(event => `
            <div class="grid-item registrable-event-card bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col card-hover">
                <img src="${event.coverImage || 'https://placehold.co/800x600/e2e8f0/64748b?text=活動主圖'}" alt="${event.title}" class="w-full h-auto object-cover rounded-md mb-4">
                <div class="flex-grow flex flex-col">
                    <p class="text-sm text-amber-600 mb-1">${event.date}</p>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">${event.title}</h3>
                    <p class="text-slate-600 text-sm mb-4 flex-grow">${event.description}</p>
                    <div class="mt-auto pt-4 border-t border-slate-200">
                         <button class="register-btn w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
                            data-event-title="${event.title}" data-require-id="${event.requireID}"
                            data-require-birthday="${event.requireBirthday}" data-require-address="${event.requireAddress}">
                            我要報名
                        </button>
                    </div>
                </div>
            </div>`).join('');
        const msnry = new Masonry(grid, { itemSelector: '.grid-item', columnWidth: '.grid-item', percentPosition: true, gutter: 24 });
        imagesLoaded(grid).on('progress', () => msnry.layout());
        document.querySelectorAll('.register-btn').forEach(button => button.addEventListener('click', openRegistrationModal));
    } catch (error) {
        console.error("無法獲取可報名活動:", error);
        loadingIndicator.style.display = 'none';
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入可報名活動，請稍後再試。</p>';
    }
}

async function fetchEventsData() {
    const eventsList = document.getElementById('events-list');
    const loadingIndicator = document.getElementById('events-loading');
    try {
        const response = await fetch('/api/get-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = events.length === 0
            ? '<p class="col-span-full text-center text-slate-500">目前沒有新的活動紀實。</p>'
            : events.map(event => `
                <div class="card-hover bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col">
                    <img src="${event.coverImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=無圖片'}" alt="${event.title}" class="w-full h-40 object-cover rounded-md mb-4">
                    <div class="flex-grow">
                        <p class="text-sm text-amber-600 mb-1">${event.date}</p>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">${event.title}</h3>
                        <p class="text-slate-600 text-sm">${event.summary}</p>
                    </div>
                </div>`).join('');
    } catch (error) {
        console.error("無法獲取活動紀實:", error);
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入活動紀實，請稍後再試。</p>';
    }
}

// --- 報名 Modal ---
function openRegistrationModal(event) {
    const button = event.currentTarget;
    const title = button.dataset.eventTitle;
    modalEventTitle.textContent = title;
    eventNameInput.value = title;
    
    const fields = { idNumber: 'requireId', birthday: 'requireBirthday', address: 'requireAddress' };
    Object.entries(fields).forEach(([field, dataAttr]) => {
        const required = button.dataset[dataAttr] === 'true';
        document.getElementById(`${field}-group`).classList.toggle('hidden', !required);
        document.getElementById(field).required = required;
    });
    
    registrationModal.classList.remove('hidden');
}

function closeRegistrationModal() {
    registrationForm.reset();
    registrationModal.classList.add('hidden');
    [idNumberGroup, birthdayGroup, addressGroup].forEach(el => el.classList.add('hidden'));
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    setSubmitButtonLoading(true, submitRegBtn, submitBtnText, submitBtnSpinner);
    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/submit-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || '發生未知錯誤');
        closeRegistrationModal();
        showResultModal(true, `報名成功！`, `您的報名「${data.eventName}」已成功送出。您的報名編號為：<strong>${result.registrationId}</strong>。請妥善保管此編號以便日後查詢。`);
    } catch (error) {
        console.error('報名失敗:', error);
        closeRegistrationModal();
        showResultModal(false, '報名失敗', `系統似乎發生了一些問題，請稍後再試或直接與本宮聯繫。<br><small>錯誤詳情：${error.message}</small>`);
    } finally {
        setSubmitButtonLoading(false, submitRegBtn, submitBtnText, submitBtnSpinner);
    }
}

// --- 報名查詢/取消 ---
async function handleFindRegistration(event) {
    event.preventDefault();
    setSubmitButtonLoading(true, findBtn, findBtnText, findBtnSpinner);
    cancellationResultArea.innerHTML = '';
    cancellationResultArea.classList.add('hidden');

    const registrationId = document.getElementById('searchRegistrationId').value;
    const phoneNumber = document.getElementById('searchPhoneNumber').value;

    try {
        const response = await fetch('/api/find-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId, phoneNumber }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        displayCancellationCard(result);

    } catch (error) {
        displayCancellationError(error.message);
    } finally {
        setSubmitButtonLoading(false, findBtn, findBtnText, findBtnSpinner);
    }
}

function displayCancellationCard(data) {
    const isCancellable = data.status === 'Confirmed';
    const statusClass = data.status === 'Cancelled' ? 'status-cancelled' : 'status-confirmed';
    const cardHTML = `
        <div class="border border-slate-200 rounded-lg p-6">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-sm text-slate-500">報名活動</p>
                    <h4 class="text-xl font-bold text-slate-800">${data.eventName}</h4>
                </div>
                <span class="status-tag ${statusClass}">${data.status === 'Confirmed' ? '已確認' : '已取消'}</span>
            </div>
            <p class="text-sm text-slate-500 mt-2">報名大名：${data.registrantName}</p>
            ${isCancellable ? `
            <div class="mt-6 border-t pt-4">
                <p class="text-sm text-slate-600 mb-3">若您確定要取消此筆報名，請點擊下方按鈕。此操作無法復原。</p>
                <button id="confirm-cancel-btn" data-page-id="${data.pageId}" class="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                    確定要取消報名
                </button>
            </div>
            ` : ''}
        </div>
    `;
    cancellationResultArea.innerHTML = cardHTML;
    cancellationResultArea.classList.remove('hidden');

    if (isCancellable) {
        document.getElementById('confirm-cancel-btn').addEventListener('click', handleCancelRegistration);
    }
}

function displayCancellationError(message) {
    cancellationResultArea.innerHTML = `<div class="bg-red-100 border border-red-200 text-red-800 text-sm rounded-lg p-4">${message}</div>`;
    cancellationResultArea.classList.remove('hidden');
}

async function handleCancelRegistration(event) {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = '取消中...';

    const pageId = button.dataset.pageId;

    try {
        const response = await fetch('/api/cancel-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        // Refresh the card view
        handleFindRegistration(new Event('submit', { cancelable: true }));
        showResultModal(true, '取消成功', '您的報名紀錄已成功取消。');

    } catch (error) {
        showResultModal(false, '取消失敗', `無法取消您的報名，請稍後再試。錯誤詳情：${error.message}`);
        button.disabled = false;
        button.textContent = '確定要取消報名';
    }
}


// --- 通用輔助函數 ---
function setSubmitButtonLoading(isLoading, button, textEl, spinnerEl) {
    if (isLoading) {
        textEl.classList.add('hidden');
        spinnerEl.classList.remove('hidden');
        button.disabled = true;
    } else {
        textEl.classList.remove('hidden');
        spinnerEl.classList.add('hidden');
        button.disabled = false;
    }
}

function showResultModal(isSuccess, title, message) {
    resultIconContainer.innerHTML = isSuccess
        ? `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
        : `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    resultIconContainer.className = `mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
    resultTitle.textContent = title;
    resultMessage.innerHTML = message;
    resultModal.classList.remove('hidden');
}

function closeResultModal() {
    resultModal.classList.add('hidden');
}

