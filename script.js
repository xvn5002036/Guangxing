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
     fetchArticlesData(); // [新增] 載入文章資料
 }

 // --- UI 相關 ---
 function setupScrollAnimation() { /* ... 不變 ... */ }
 function toggleMobileMenu() { if (mobileMenu) mobileMenu.classList.toggle('hidden'); }
 function handleHeaderScroll() { /* ... 不變 ... */ }

 // --- 資料獲取與渲染 ---

 // [新增] 載入文章資料
 async function fetchArticlesData() {
     const list = document.getElementById('articles-list');
     const loadingIndicator = document.getElementById('articles-loading');
     if (!list || !loadingIndicator) return;

     try {
         const response = await fetch('/api/get-articles');
         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
         const articles = await response.json();

         loadingIndicator.style.display = 'none';

         if (articles.length === 0) {
             list.innerHTML = '<p class="text-center text-slate-500">目前沒有相關知識文章。</p>';
             return;
         }

         list.innerHTML = articles.map(article => `
             <div class="article-card">
                 <h3>${article.title}</h3>
                 <p class="publish-date">${article.publishDate || ''}</p>
                 <p>${article.content}</p>
                 </div>
         `).join('');

     } catch (error) {
         console.error("無法獲取文章資料:", error);
         loadingIndicator.style.display = 'none';
         list.innerHTML = '<p class="text-center text-red-500">無法載入文章，請稍後再試。</p>';
     }
 }


 async function fetchDeitiesData() { /* ... 不變 ... */ }
 async function fetchNewsData() { /* ... 不變 ... */ }
 async function fetchRegistrableEventsData() { /* ... 不變 ... */ }
 async function fetchEventsDataForAlbums() { /* ... 不變 ... */ }
 async function openAlbumGallery(event) { /* ... 不變 ... */ }
 async function handleFortuneShake(event) { /* ... 不變 ... */ }
 function openFortuneModal() { /* ... 不變 ... */ }
 function closeFortuneModal() { /* ... 不變 ... */ }
 function openRegistrationModal(event) { /* ... 不變 ... */ }
 function closeRegistrationModal() { /* ... 不變 ... */ }
 async function handleRegistrationSubmit(event) { /* ... 不變 ... */ }
 async function handleFindRegistration(event) { /* ... 不變 ... */ }
 function displayCancellationCards(dataArray) { /* ... 不變 ... */ }
 function displayCancellationError(message) { /* ... 不變 ... */ }
 async function handleCancelRegistration(event) { /* ... 不變 ... */ }
 function setSubmitButtonLoading(isLoading, button, textEl, spinnerEl) { /* ... 不變 ... */ }
 function showResultModal(isSuccess, title, message) { /* ... 不變 ... */ }
 function closeResultModal() { /* ... 不變 ... */ }