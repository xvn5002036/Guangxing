# 新莊武壇廣行宮 官方網站 (Guangxing Temple Website)

這是一個為「新莊武壇廣行宮」開發的現代化、無頭 (Headless) 網站專案。

網站前端使用 HTML、CSS 和 Vanilla JavaScript 構建，所有動態內容（如最新消息、活動、神明介紹等）均透過 API 從 [Notion](https://www.notion.so/) 資料庫中即時獲取。相簿功能則串接了 [Cloudinary](https://cloudinary.com/) 雲端圖片服務。

這種架構使得宮廟管理人員只需更新 Notion 頁面，網站內容就會自動同步，無需具備程式設計知識。

## 核心功能

* **最新消息** (`/api/get-news`): 從 Notion 載入最新消息，並以 Swiper.js 輪播顯示。
* **祀奉神明** (`/api/get-deities`): 從 Notion 載入神明介紹列表。
* **線上求籤** (`/api/get-fortune-slip`): 從 Notion 籤詩資料庫中隨機抽取一支籤詩。
* **年度行事曆** (`/api/get-calendar-events`): 從 Notion 載入活動，並使用 [FullCalendar](https://fullcalendar.io/) 渲染成互動式日曆。
* **參拜知識** (`/api/get-articles`): 從 Notion 載入文章列表。
* **活動報名** (`/api/get-registrable-events`, `/api/submit-registration`):
    * 載入 Notion 中「開放報名」的活動。
    * 支援需要密碼的「內部活動」。
    * 將報名資料（姓名、電話、選填欄位等）回寫到 Notion 資料庫。
* **報名查詢/取消** (`/api/find-registration`, `/api/cancel-registration`):
    * 允許使用者查詢自己的報名紀錄。
    * 允許使用者將自己的報名狀態更新為「Cancelled」。
* **活動紀實** (`/api/get-events`, `/api/get-album-images`):
    * 從 Notion 載入活動紀實相簿列表。
    * 支援兩種模式：
        1.  **Cloudinary 相簿**：點擊後呼叫 API 載入 Cloudinary 資料夾中的所有照片，並以 [LightGallery.js](https://www.lightgalleryjs.com/) 燈箱顯示。
        2.  **外部影片**：如果 Notion 欄位中填的是影片連結，則直接在燈箱中播放影片。

## 技術棧 (Technology Stack)

### 前端 (Frontend)

* **HTML5 / CSS3**: 基礎網頁結構與樣式。
* **TailwindCSS (CDN)**: 用於快速建構 UI 的 CSS 框架。
* **Vanilla JavaScript (ES6+)**: 處理所有 DOM 操作與 API 請求。
* **JavaScript 函式庫**:
    * [FullCalendar.js](https://fullcalendar.io/): 用於「年度行事曆」。
    * [Swiper.js](https://swiperjs.com/): 用於「最新消息」輪播。
    * [Masonry.js](https://masonry.desandro.com/): 用於「活動報名」的瀑布流排版。
    * [LightGallery.js](https://www.lightgalleryjs.com/): 用於「活動紀實」的相簿燈箱。

### 後端 (Backend) / 服務 (Services)

* **Vercel**:
    * 作為網站的託管 (Hosting) 平台。
    * 使用其 Serverless Functions (無伺服器函式) 執行 `api/` 目錄下的所有後端邏輯。
* **Notion**:
    * 作為主要的 CMS (內容管理系統)。所有網站文字、圖片、活動資料皆儲存於此。
* **Cloudinary**:
    * 作為「活動紀實」的圖片儲存庫 (Image Hosting)。

## 安裝與設定 (Setup)

本專案依賴大量的 API 金鑰與資料庫 ID，這些都必須透過「環境變數」來設定。

1.  **複製專案**：
    ```bash
    git clone [您的專案 Git 網址]
    cd [專案資料夾]
    ```

2.  **安裝依賴 (非必要，Vercel 會自動處理)**：
    * 本專案的後端 API 依賴 `package.json` 中的套件。
    ```bash
    npm install
    ```

3.  **設定環境變數**：
    在 Vercel 部署時，您**必須**在專案設定中新增以下的環境變數：

    ```ini
    # --- Notion API 金鑰 ---
    # 建立一個 Notion Integration，並取得您的 Internal Integration Token
    NOTION_API_KEY= "secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    # --- Notion 資料庫 ID ---
    # (注意：每個 ID 都是 Notion 資料庫網址中的一長串亂碼)
    
    # 1. 最新消息 (get-news.js)
    NOTION_NEWS_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 2. 祀奉神明 (get-deities.js)
    NOTION_DEITIES_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 3. 線上求籤 (get-fortune-slip.js)
    NOTION_FORTUNE_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 4. 年度行事曆 (get-calendar-events.js)
    NOTION_CALENDAR_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 5. 參拜知識 (get-articles.js)
    NOTION_ARTICLES_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 6. 可報名活動 (get-registrable-events.js)
    NOTION_REGISTRABLE_EVENTS_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 7. 活動紀實 (get-events.js)
    NOTION_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    # 8. 報名資料庫 (submit-registration.js / find-registration.js)
    NOTION_REGISTRATIONS_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    # --- Cloudinary API 金鑰 ---
    # (用於 get-album-images.js)
    CLOUDINARY_CLOUD_NAME="xxxxxxxxx"
    CLOUDINARY_API_KEY="xxxxxxxxxxxxxxx"
    CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

## 部署 (Deployment)

* **平台**：建議使用 [Vercel](https://vercel.com/)。
* **設定**：
    * 框架 (Framework Preset): `Other`
    * 根目錄 (Root Directory): `./`
    * （無需更改任何建置指令）

Vercel 將會自動偵測 `api/` 目錄並將其部署為 Serverless Functions，同時將 `index.html`, `script.js`, `style.css` 等靜態檔案作為網站前端。