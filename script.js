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
    } catch (error) {
        console.error("無法獲取神明資料:", error);
        loadingIndicator.style.display = 'none';
        grid.innerHTML = `<p class="col-span-full text-center text-red-500">無法載入神明資料，請稍後再試。</p>`;
    }
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
    } catch (error) {
        console.error("無法獲取最新消息:", error);
        loadingIndicator.style.display = 'none';
        swiperWrapper.innerHTML = `<div class="swiper-slide"><p class="text-red-500">無法載入最新消息，請稍後再試。</p></div>`;
    }
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
        // Initialize Masonry after adding items
        if (typeof Masonry !== 'undefined' && typeof imagesLoaded !== 'undefined') {
            imagesLoaded(grid, function() {
              const msnry = new Masonry(grid, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-item',
                percentPosition: true,
                gutter: 24 // 確保與 style.css 一致
              });
            });
        }
        document.querySelectorAll('.register-btn').forEach(button => button.addEventListener('click', openRegistrationModal));
    } catch (error) {
        console.error("無法獲取可報名活動:", error);
        loadingIndicator.style.display = 'none';
        grid.innerHTML = `<p class="col-span-full text-center text-red-500">無法載入活動，請稍後再試。</p>`;
    }
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
        let hasContent = false; // Flag to check if any albums were added
        events.forEach(event => {
            // Only add card if there is an album folder or a video link
            if (event.albumFolder || event.videoLink) {
                hasContent = true;
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
            }
        });

        // If no albums with content were found, display the message
        if (!hasContent) {
             albumList.innerHTML = '<p class="col-span-full text-center text-slate-500">目前沒有活動紀實相簿。</p>';
        } else {
             document.querySelectorAll('.album-card').forEach(card => card.addEventListener('click', openAlbumGallery));
        }

    } catch (error) {
        console.error("無法獲取相簿資料:", error);
        loadingIndicator.style.display = 'none';
        albumList.innerHTML = `<p class="col-span-full text-center text-red-500">無法載入相簿，請稍後再試。</p>`;
    }
}


// [!! 已補全 !!] 開啟相簿燈箱 (支援影片)
async function openAlbumGallery(event) {
    const card = event.currentTarget;
    const folder = card.dataset.albumFolder;
    const title = card.dataset.albumTitle;
    const videoLink = card.dataset.videoLink;

    if (typeof lightGallery === 'undefined') {
        alert('相簿功能載入失敗。');
        return;
    }

    // 1. 如果是影片連結，直接播放影片
    if (videoLink) {
        const videoGallery = lightGallery(document.createElement('div'), {
            dynamic: true,
            dynamicEl: [{
                'src': videoLink,
                'subHtml': `<h4>${title}</h4>`
            }],
            plugins: [lgVideo],
            licenseKey: '0000-0000-000-0000', // Replace with your actual license key if you have one
            download: false
        });
        videoGallery.openGallery(0);
        return;
    }

    // 2. 如果是相簿資料夾，抓取圖片
    if (folder) {
        try {
            // Show a simple loading indicator (optional)
            card.style.cursor = 'wait';

            const response = await fetch(`/api/get-album-images?folder=${encodeURIComponent(folder)}`);
            if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || '無法讀取相簿內容');
            }

            const data = await response.json();
            const cloudName = data.cloudName;
            const images = data.images;

            if (!cloudName) {
                throw new Error('Cloudinary cloud name not configured.');
            }

            if (!images || images.length === 0) {
                alert('此相簿目前沒有照片。');
                return;
            }

            const dynamicEl = images.map(img => {
                const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${img.version}/${img.public_id}.${img.format}`;
                return {
                    'src': imageUrl, // Use original image for main view
                    'thumb': `https://res.cloudinary.com/${cloudName}/image/upload/w_200,h_200,c_fill,q_auto/v${img.version}/${img.public_id}.${img.format}`, // Smaller thumbnail
                    'subHtml': `<h4>${title}</h4>`
                };
            });

            const imageGallery = lightGallery(document.createElement('div'), {
                dynamic: true,
                dynamicEl: dynamicEl,
                plugins: [lgThumbnail],
                licenseKey: '0000-0000-000-0000', // Replace with your actual license key
                thumbnail: true,
                download: false
            });
            imageGallery.openGallery(0);

        } catch (error) {
            console.error('開啟相簿失敗:', error);
            alert(`開啟相簿失敗：${error.message}`);
        } finally {
            card.style.cursor = 'pointer'; // Reset cursor
        }
    }
}


// [!! 已補全 !!] 線上求籤
async function handleFortuneShake(event) {
    if (!shakeButton || shakeButton.classList.contains('is-shaking')) return; // 防止重複點擊 or element not found

    shakeButton.classList.add('is-shaking');
    if (shakeLoadingText) shakeLoadingText.textContent = '王爺賜籤中，請稍候...';

    try {
        // 延遲 1.5 秒模擬抽籤過程
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch('/api/get-fortune-slip'); // 呼叫 API
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const slip = await response.json();

        // 填充 Modal 內容 (增加檢查元素是否存在)
        const titleEl = document.getElementById('fortune-title');
        const typeEl = document.getElementById('fortune-type');
        const poemEl = document.getElementById('fortune-poem');
        const interpretationEl = document.getElementById('fortune-interpretation');

        if (titleEl) titleEl.textContent = slip.title || '籤詩';
        if (typeEl) {
            typeEl.textContent = slip.type || '平';
            // 根據吉凶更換顏色 (使用 Tailwind)
            typeEl.className = 'inline-block py-1 px-4 text-lg font-bold rounded-full mb-6'; // 重置樣式
            switch (slip.type) {
                case '上上':
                case '上吉':
                    typeEl.classList.add('bg-red-100', 'text-red-700');
                    break;
                case '下下':
                case '下':
                    typeEl.classList.add('bg-slate-200', 'text-slate-700');
                    break;
                default: // 中吉, 中, 中平 etc.
                    typeEl.classList.add('bg-amber-100', 'text-amber-800');
            }
        }
        if (poemEl) poemEl.textContent = slip.poem || '';
        // 將 \n 替換為 <br> 以保留換行
        if (interpretationEl) {
             interpretationEl.innerHTML = (slip.interpretation || '').replace(/\n/g, '<br>');
        }


        openFortuneModal(); // 打開 Modal

    } catch (error) {
        console.error("求籤時發生錯誤:", error);
        if (shakeLoadingText) shakeLoadingText.textContent = `求籤失敗：${error.message}`;
        // 顯示一個錯誤的 Result Modal
        showResultModal(false, "求籤失敗", "無法連接至王爺的籤筒，請稍後再試。");
    } finally {
        if (shakeButton) shakeButton.classList.remove('is-shaking');
        // 5秒後清除提示文字
        setTimeout(() => {
            if (shakeLoadingText) shakeLoadingText.textContent = '';
        }, 5000);
    }
}

function openFortuneModal() {
    if (fortuneModal) {
        fortuneModal.classList.remove('hidden');
        fortuneModal.classList.add('flex'); // 確保 flex 生效
    }
}

function closeFortuneModal() {
    if (fortuneModal) {
        fortuneModal.classList.add('hidden');
        fortuneModal.classList.remove('flex');
    }
}

// [!! 已補全 !!] 報名 Modal
function openRegistrationModal(event) {
    const button = event.currentTarget;
    const title = button.dataset.eventTitle;

    // 根據 data-require-* 屬性決定是否顯示選填欄位
    const requireId = button.dataset.requireId === 'true';
    const requireBirthday = button.dataset.requireBirthday === 'true';
    const requireAddress = button.dataset.requireAddress === 'true';

    if (modalEventTitle) modalEventTitle.textContent = title;
    if (eventNameInput) eventNameInput.value = title;

    // Toggle visibility and requirement based on data attributes
    if (idNumberGroup) idNumberGroup.style.display = requireId ? 'block' : 'none';
    if (idNumberInput) idNumberInput.required = requireId;

    if (birthdayGroup) birthdayGroup.style.display = requireBirthday ? 'block' : 'none';
    if (birthdayInput) birthdayInput.required = requireBirthday;

    if (addressGroup) addressGroup.style.display = requireAddress ? 'block' : 'none';
    if (addressInput) addressInput.required = requireAddress;


    if (registrationModal) {
        registrationModal.classList.remove('hidden');
        registrationModal.classList.add('flex');
    }
}


function closeRegistrationModal() {
    if (registrationModal) {
        registrationModal.classList.add('hidden');
        registrationModal.classList.remove('flex');
    }
    if (registrationForm) registrationForm.reset(); // 清空表單
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    setSubmitButtonLoading(true, submitRegBtn, submitBtnText, submitBtnSpinner);

    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());

    // Filter out optional fields if they were hidden and not required
    if (idNumberGroup && idNumberGroup.style.display === 'none') delete data.idNumber;
    if (birthdayGroup && birthdayGroup.style.display === 'none') delete data.birthday;
    if (addressGroup && addressGroup.style.display === 'none') delete data.address;


    try {
        const response = await fetch('/api/submit-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || '報名失敗');
        }

        closeRegistrationModal();
        showResultModal(true, "報名成功！", `感謝您的報名。\n您的報名編號為：${result.registrationId}`);

    } catch (error) {
        console.error('報名提交失敗:', error);
        // Don't close modal on error, show error inside or below form?
        // For now, closing and showing error modal
        closeRegistrationModal();
        showResultModal(false, "報名失敗", `送出資料時發生錯誤，請稍後再試或聯絡本宮。(${error.message})`);
    } finally {
        setSubmitButtonLoading(false, submitRegBtn, submitBtnText, submitBtnSpinner);
    }
}

// [!! 已補全 !!] 查詢/取消
async function handleFindRegistration(event) {
    event.preventDefault();
    if (!findBtn || !findBtnText || !findBtnSpinner) return; // Add checks
    setSubmitButtonLoading(true, findBtn, findBtnText, findBtnSpinner);
    if (cancellationResultArea) cancellationResultArea.innerHTML = ''; // 清空舊結果

    const nameInput = document.getElementById('searchName');
    const phoneInput = document.getElementById('searchPhoneNumber');

    if (!nameInput || !phoneInput) {
         displayCancellationError('找不到查詢欄位。');
         setSubmitButtonLoading(false, findBtn, findBtnText, findBtnSpinner);
         return;
    }

    const name = nameInput.value;
    const phoneNumber = phoneInput.value;

    try {
        const response = await fetch('/api/find-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phoneNumber }),
        });

        const result = await response.json();
        if (!response.ok) {
            // Handle 404 specifically
            if (response.status === 404) {
                 throw new Error('找不到符合的報名紀錄。請確認您輸入的資料是否正確。');
            }
            throw new Error(result.message || '查詢失敗');
        }

        displayCancellationCards(result); // 顯示結果

    } catch (error) {
        console.error('查詢失敗:', error);
        displayCancellationError(error.message);
    } finally {
        setSubmitButtonLoading(false, findBtn, findBtnText, findBtnSpinner);
    }
}

function displayCancellationCards(dataArray) {
    if (!cancellationResultArea) return;
    if (!Array.isArray(dataArray)) { // Check if dataArray is actually an array
        displayCancellationError('查詢結果格式錯誤。');
        return;
    }
    if (dataArray.length === 0) {
        displayCancellationError('找不到符合的報名紀錄。');
        return;
    }

    const cardsHtml = dataArray.map(record => {
        // Basic validation of record structure
        if (!record || !record.eventName || !record.registrationId || !record.status) {
            console.warn('Skipping invalid record:', record);
            return ''; // Skip rendering this card
        }
        const isConfirmed = record.status === 'Confirmed';
        return `
        <div class="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-start flex-wrap gap-2"> <div>
                    <h4 class="font-bold text-slate-800">${record.eventName}</h4>
                    <p class="text-sm text-slate-500">報名編號: ${record.registrationId}</p>
                </div>
                <span class="status-tag ${isConfirmed ? 'status-confirmed' : 'status-cancelled'}">
                    ${isConfirmed ? '報名成功' : '已取消'}
                </span>
            </div>
            ${isConfirmed ? `
            <div class="mt-4 pt-4 border-t border-slate-100">
                <button
                    class="confirm-cancel-btn w-full text-sm bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-page-id="${record.pageId}"
                    data-event-name="${record.eventName}">
                    確定要取消「${record.eventName}」?
                </button>
            </div>` : ''}
        </div>
    `}).join('');

    cancellationResultArea.innerHTML = cardsHtml;
    cancellationResultArea.classList.remove('hidden');

    // Add event listeners to cancel buttons
    document.querySelectorAll('.confirm-cancel-btn').forEach(button => {
        button.addEventListener('click', handleCancelRegistration);
    });
}

function displayCancellationError(message) {
    if (cancellationResultArea) {
        cancellationResultArea.innerHTML = `<p class="text-center text-red-500">${message}</p>`;
        cancellationResultArea.classList.remove('hidden');
    }
}

async function handleCancelRegistration(event) {
    const button = event.currentTarget;
    const pageId = button.dataset.pageId;
    const eventName = button.dataset.eventName;

    if (!pageId) {
         showResultModal(false, "取消失敗", "找不到報名紀錄 ID。");
         return;
    }


    if (!confirm(`您確定要取消報名「${eventName}」嗎？此動作無法復原。`)) {
        return;
    }

    button.disabled = true;
    button.textContent = '取消中...';

    try {
        const response = await fetch('/api/cancel-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageId }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || '取消失敗');
        }

        showResultModal(true, "取消成功", `您已成功取消「${eventName}」的報名。`);
        // Refresh the search results to show the updated status
        if (findRegistrationForm) {
            // Manually trigger the submit event on the form
             const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
             findRegistrationForm.dispatchEvent(submitEvent);
        }

    } catch (error) {
        console.error('取消失敗:', error);
        showResultModal(false, "取消失敗", `取消報名時發生錯誤：${error.message}`);
        button.disabled = false; // Re-enable button on error
        button.textContent = `確定要取消「${eventName}」?`;
    }
}


// [!! 已補全 !!] 通用輔助函數
function setSubmitButtonLoading(isLoading, button, textEl, spinnerEl) {
    if (!button || !textEl || !spinnerEl) return;
    if (isLoading) {
        button.disabled = true;
        textEl.classList.add('hidden');
        spinnerEl.classList.remove('hidden');
    } else {
        button.disabled = false;
        textEl.classList.remove('hidden');
        spinnerEl.classList.add('hidden');
    }
}

function showResultModal(isSuccess, title, message) {
    if (!resultModal || !resultIconContainer || !resultTitle || !resultMessage) return;

    // Clear previous icons and background
    resultIconContainer.innerHTML = '';
    resultIconContainer.classList.remove('bg-green-100', 'bg-red-100');

    if (isSuccess) {
        resultIconContainer.classList.add('bg-green-100');
        resultIconContainer.innerHTML = `<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else {
        resultIconContainer.classList.add('bg-red-100');
        resultIconContainer.innerHTML = `<svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    }

    resultTitle.textContent = title;
    // Replace newline characters with <br> for HTML display
    resultMessage.innerHTML = message.replace(/\n/g, '<br>');


    resultModal.classList.remove('hidden');
    resultModal.classList.add('flex');
}


function closeResultModal() {
    if (resultModal) {
        resultModal.classList.add('hidden');
        resultModal.classList.remove('flex');
    }
}

// --- [新增] 初始化行事曆 ---
async function initializeCalendar() {
    const calendarEl = document.getElementById('calendar-element');
    const loadingEl = document.getElementById('calendar-loading');
    const errorEl = document.getElementById('calendar-error');

    // Make sure elements exist before proceeding
    if (!calendarEl || !loadingEl || !errorEl) {
        console.error("Calendar elements not found. Cannot initialize calendar.");
        // Optionally display an error message to the user in a designated area
        return;
    }


    try {
        const response = await fetch('/api/get-calendar-events'); // 呼叫新的 API
        if (!response.ok) {
            // Try to parse error message from API response
            let errorMessage = 'Unknown error';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || JSON.stringify(errorData);
            } catch (parseError) {
                // If parsing fails, use the status text
                errorMessage = response.statusText;
            }
             throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
        }
        const events = await response.json();

        loadingEl.style.display = 'none';
        calendarEl.style.display = 'block';
        errorEl.style.display = 'none'; // Hide error message on success


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
                if (info.event.extendedProps && info.event.extendedProps.description) {
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
        calendarEl.style.display = 'none'; // Hide calendar on error
        errorEl.textContent = `無法載入行事曆資料：${error.message}`; // Display specific error
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
    if (mouseEvent && mouseEvent.target) { // Add check for target existence
      mouseEvent.target.removeEventListener('mousemove', positionTooltip);
    }
}


function positionTooltip(mouseEvent) {
     if (!tooltipElement || !mouseEvent) return; // Add check for mouseEvent
     // 簡單定位在滑鼠右下方，可再優化邊界判斷
     const x = mouseEvent.clientX + 10;
     const y = mouseEvent.clientY + 10;

     // Ensure tooltip doesn't go off-screen
     const tooltipRect = tooltipElement.getBoundingClientRect(); // Get dimensions after setting content
     const viewportWidth = window.innerWidth;
     const viewportHeight = window.innerHeight;

     let finalX = x;
     let finalY = y;

     // Adjust if too close to the right edge
     if (x + tooltipRect.width > viewportWidth - 10) { // Add a small buffer
         finalX = mouseEvent.clientX - tooltipRect.width - 10;
     }
     // Adjust if too close to the bottom edge
     if (y + tooltipRect.height > viewportHeight - 10) { // Add a small buffer
         finalY = mouseEvent.clientY - tooltipRect.height - 10;
     }
     // Adjust if too close to the left edge (after potential right-edge adjustment)
     if (finalX < 10) {
         finalX = 10;
     }
      // Adjust if too close to the top edge (after potential bottom-edge adjustment)
     if (finalY < 10) {
         finalY = 10;
     }


     tooltipElement.style.left = `${finalX}px`;
     tooltipElement.style.top = `${finalY}px`;
}