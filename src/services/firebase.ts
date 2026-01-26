import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase 設定資訊
 * 請從 Firebase Console (專案設定 -> 一般 -> 您的應用程式) 複製您的設定並貼上。
 */
const firebaseConfig = {
  apiKey: "請貼上您的_apiKey",
  authDomain: "請貼上您的_project-id.firebaseapp.com",
  projectId: "請貼上您的_project-id",
  storageBucket: "請貼上您的_project-id.firebasestorage.app",
  messagingSenderId: "請貼上您的_senderId",
  appId: "請貼上您的_appId"
};

// 檢查是否已填寫正確金鑰
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey && firebaseConfig.apiKey !== "請貼上您的_apiKey";
};

// 安全地初始化 Firebase
let app;
try {
    if (isFirebaseConfigured()) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }
} catch (error) {
    console.error("Firebase 初始化失敗:", error);
}

// 匯出資料庫實例。若未設定則為 null，DataContext 會處理此狀態。
export const db = app ? getFirestore(app) : (null as any);
