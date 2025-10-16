// --- 全域變數和 DOM 元素 ---
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.getElementById('header');

// Registration Modal Elements
const registrationModal = document.getElementById('registration-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const registrationForm = document.getElementById('registration-form');
const modalEventTitle = document.getElementById('modal-event-title');
const eventNameInput = document.getElementById('eventName');
const submitRegBtn = document.getElementById('submit-registration-btn');
const submitBtnText = document.getElementById('submit-btn-text');
const submitBtnSpinner = document.getElementById('submit-btn-spinner');

// Dynamic Field Groups
const idNumberGroup = document.getElementById('idNumber-group');
const birthdayGroup = document.getElementById('birthday-group');
const addressGroup = document.getElementById('address-group');
const idNumberInput = document.getElementById('idNumber');
const birthdayInput = document.getElementById('birthday');
const addressInput = document.getElementById('address');


// Result Modal Elements
const resultModal = document.getElementById('result-modal');
const closeResultModalBtn = document.getElementById('close-result-modal-btn');
const resultIconContainer = document.getElementById('result-icon-container');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');


// --- 初始載入和事件監聽 ---
document.addEventListener('DOMContentLoaded', () => {
    // 頁面載入時，從 Notion 獲取所有資料
    fetchAllData();

    // 綁定所有事件監聽器
    setupEventListeners();
});

function setupEventListeners() {
    // 手機版選單
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    // 頂部導覽列滾動效果
    window.addEventListener('scroll', handleHeaderScroll);

    // 報名表單互動
    closeModalBtn.addEventListener('click', closeRegistrationModal);
    registrationModal.addEventListener('click', (e) => {
        if (e.target === registrationModal) closeRegistrationModal();
    });
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
    
    // 結果訊息框
    closeResultModalBtn.addEventListener('click', closeResultModal);
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) closeResultModal();
    });
}

function fetchAllData() {
    fetchNewsData();
    fetchRegistrableEventsData();
    fetchEventsData();
}

// --- 手機版選單和導覽列 ---
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

function handleHeaderScroll() {
    if (window.scrollY > 50) {
        header.classList.add('py-2');
        header.classList.remove('py-4');
    } else {
        header.classList.add('py-4');
        header.classList.remove('py-2');
    }
}

// --- 資料獲取與渲染 ---

// 獲取最新消息 (輪播)
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
       
        new Swiper('.newsSwiper', {
            loop: newsItems.length > 1,
            autoplay: { delay: 5000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
        });

    } catch (error) {
        console.error("無法獲取最新消息:", error);
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`;
    }
}


// 獲取可報名活動 (瀑布流)
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

        let eventCardsHTML = '';
        events.forEach(event => {
            eventCardsHTML += `
                <div class="grid-item registrable-event-card bg-white p-6 rounded-lg shadow-lg overflow-hidden flex flex-col card-hover">
                    <img src="${event.coverImage || 'https://placehold.co/600x400/e2e8f0/64748b?text=活動主圖'}" alt="${event.title}" class="w-full h-auto object-cover rounded-md mb-4">
                    <div class="flex-grow flex flex-col">
                        <p class="text-sm text-amber-600 mb-1">${event.date}</p>
                        <h3 class="text-xl font-bold text-slate-800 mb-2">${event.title}</h3>
                        <p class="text-slate-600 text-sm mb-4 flex-grow">${event.description}</p>
                        <div class="mt-auto pt-4 border-t border-slate-200">
                             <button class="register-btn w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
                                data-event-title="${event.title}"
                                data-require-id="${event.requireID}"
                                data-require-birthday="${event.requireBirthday}"
                                data-require-address="${event.requireAddress}">
                                我要報名
                            </button>
                        </div>
                    </div>
                </div>`;
        });
        grid.innerHTML = eventCardsHTML;

        // 初始化 Masonry
        const msnry = new Masonry(grid, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-item',
            percentPosition: true,
            gutter: 24
        });
        
        imagesLoaded(grid).on('progress', () => msnry.layout());
        
        // 為新的按鈕綁定事件
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', openRegistrationModal);
        });

    } catch (error) {
        console.error("無法獲取可報名活動:", error);
        loadingIndicator.style.display = 'none';
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入可報名活動，請稍後再試。</p>';
    }
}


// 獲取活動紀實 (一般網格)
async function fetchEventsData() {
    const eventsList = document.getElementById('events-list');
    const loadingIndicator = document.getElementById('events-loading');
    try {
        const response = await fetch('/api/get-events');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const events = await response.json();
        
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = ''; 
        
        if (events.length === 0) {
            eventsList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有新的活動紀實。</p>';
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
        console.error("無法獲取活動紀實:", error);
        loadingIndicator.style.display = 'none';
        eventsList.innerHTML = '<p class="col-span-full text-center text-red-500">無法載入活動紀實，請稍後再試。</p>';
    }
}


// --- 報名表單 Modal ---
function openRegistrationModal(event) {
    const button = event.currentTarget;
    const title = button.dataset.eventTitle;
    
    // 設定表單標題和隱藏欄位
    modalEventTitle.textContent = title;
    eventNameInput.value = title;
    
    // 根據按鈕的 data-* 屬性，動態顯示或隱藏欄位
    toggleElement(idNumberGroup, button.dataset.requireId === 'true');
    toggleElement(birthdayGroup, button.dataset.requireBirthday === 'true');
    toggleElement(addressGroup, button.dataset.requireAddress === 'true');

    // 設定對應欄位是否為必填
    idNumberInput.required = button.dataset.requireId === 'true';
    birthdayInput.required = button.dataset.requireBirthday === 'true';
    addressInput.required = button.dataset.requireAddress === 'true';
    
    registrationModal.classList.remove('hidden');
}

function closeRegistrationModal() {
    registrationForm.reset(); // 清空表單
    registrationModal.classList.add('hidden');
    // 隱藏所有動態欄位，以備下次使用
    [idNumberGroup, birthdayGroup, addressGroup].forEach(el => el.classList.add('hidden'));
}

function toggleElement(element, show) {
    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    setSubmitButtonLoading(true);

    const formData = new FormData(registrationForm);
    const data = {
        registrantName: formData.get('registrantName'),
        phoneNumber: formData.get('phoneNumber'),
        eventName: formData.get('eventName'),
        // 只有在欄位可見時才讀取其值
        idNumber: idNumberInput.required ? formData.get('idNumber') : null,
        birthday: birthdayInput.required ? formData.get('birthday') : null,
        address: addressInput.required ? formData.get('address') : null,
    };
    
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

        closeRegistrationModal();
        showResultModal(true, `報名成功！`, `您的報名「${data.eventName}」已成功送出。您的報名編號為：<strong>${result.registrationId}</strong>。請妥善保管此編號以便日後查詢。`);
        
    } catch (error) {
        console.error('報名失敗:', error);
        closeRegistrationModal();
        showResultModal(false, '報名失敗', `很抱歉，系統似乎發生了一些問題，請稍後再試或直接與本宮聯繫。錯誤詳情：${error.message}`);
    } finally {
        setSubmitButtonLoading(false);
    }
}

function setSubmitButtonLoading(isLoading) {
    if (isLoading) {
        submitBtnText.classList.add('hidden');
        submitBtnSpinner.classList.remove('hidden');
        submitRegBtn.disabled = true;
    } else {
        submitBtnText.classList.remove('hidden');
        submitBtnSpinner.classList.add('hidden');
        submitRegBtn.disabled = false;
    }
}


// --- 結果訊息 Modal ---
function showResultModal(isSuccess, title, message) {
    // 設定圖示
    resultIconContainer.innerHTML = isSuccess ? 
        `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` : 
        `<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    
    resultIconContainer.className = `mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
    
    // 設定文字
    resultTitle.textContent = title;
    resultMessage.innerHTML = message; // Use innerHTML to render the <strong> tag
    
    resultModal.classList.remove('hidden');
}

function closeResultModal() {
    resultModal.classList.add('hidden');
}
