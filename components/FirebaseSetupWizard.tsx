
import React, { useState } from 'react';
import { isFirebaseConfigured } from '../services/firebase';
import { Settings, Database, Copy, CheckCircle, X, ExternalLink, ChevronRight, AlertTriangle } from 'lucide-react';

const FirebaseSetupWizard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  // If properly configured, do not show this wizard
  if (isFirebaseConfigured() || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-mystic-charcoal border border-mystic-gold/30 rounded-lg max-w-4xl w-full shadow-2xl flex flex-col my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-gray-900 to-mystic-charcoal">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">網站尚未連線至資料庫</h2>
                    <p className="text-sm text-gray-400">請完成以下三個步驟，讓您的後台設定可以永久保存</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white px-3 py-1 text-xs border border-gray-700 rounded hover:bg-white/10">
                暫時略過 (資料將無法儲存)
            </button>
        </div>

        {/* Steps Content */}
        <div className="p-8 space-y-10">
            
            {/* Step 1: Get Config */}
            <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 bg-mystic-gold text-black font-bold rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(197,160,89,0.5)]">1</div>
                    <div className="w-1 h-full bg-white/10 my-2"></div>
                </div>
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings size={20} className="text-mystic-gold" />
                        取得連線設定碼 (Config)
                    </h3>
                    <div className="bg-black/40 border border-white/5 p-4 rounded text-gray-300 text-sm leading-relaxed space-y-2">
                        <p>1. 回到 Firebase Console 畫面。</p>
                        <p>2. 點擊左上角的 <span className="text-white font-bold bg-gray-700 px-1 rounded">⚙️ 齒輪圖示</span> → 選擇 <span className="text-white font-bold">專案設定 (Project Settings)</span>。</p>
                        <p>3. 捲動到最下方的 <span className="text-white font-bold">您的應用程式 (Your apps)</span> 區塊。</p>
                        <p>4. 選擇您的 Web App (圖示為 <span className="text-white font-bold">&lt;/&gt;</span>)，若尚未建立請點擊新增。</p>
                        <p>5. 複製 <span className="text-green-400 font-mono">const firebaseConfig = &#123; ... &#125;;</span> 這段程式碼。</p>
                    </div>
                </div>
            </div>

            {/* Step 2: Paste Code */}
            <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-700 text-white font-bold rounded-full flex items-center justify-center text-xl border border-white/20">2</div>
                    <div className="w-1 h-full bg-white/10 my-2"></div>
                </div>
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Copy size={20} className="text-blue-400" />
                        貼上程式碼
                    </h3>
                    <div className="text-gray-300 text-sm">
                        <p className="mb-2">打開專案中的 <code className="bg-gray-800 px-2 py-1 rounded text-orange-300">services/firebase.ts</code> 檔案，將剛剛複製的內容取代原本的佔位符：</p>
                        <div className="bg-gray-900 p-4 rounded border-l-4 border-green-500 font-mono text-xs overflow-x-auto">
<pre>{`const firebaseConfig = {
  apiKey: "AIzaSyB...",  <-- 貼上您的真實金鑰
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};`}</pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3: Create Database */}
            <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-700 text-white font-bold rounded-full flex items-center justify-center text-xl border border-white/20">3</div>
                </div>
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database size={20} className="text-red-400" />
                        建立資料庫 (關鍵步驟)
                    </h3>
                    <div className="bg-red-900/10 border border-red-500/30 p-4 rounded text-gray-300 text-sm leading-relaxed space-y-3">
                        <div className="flex items-start gap-2 text-red-300 font-bold mb-2">
                            <AlertTriangle size={16} className="mt-0.5" />
                            <span>不做這步，網站會壞掉！</span>
                        </div>
                        <p>1. 在 Firebase Console 左側選單，點擊 <span className="text-white font-bold">建構 (Build)</span> → <span className="text-white font-bold">Firestore Database</span>。</p>
                        <p>2. 點擊 <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">建立資料庫 (Create database)</span>。</p>
                        <p>3. <span className="text-mystic-gold font-bold underline">務必選擇「以測試模式啟動」(Start in test mode)</span>。</p>
                        <p className="opacity-70 text-xs pl-4">* 若未選測試模式，前台將無法寫入資料。</p>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm mb-4">完成以上步驟並儲存檔案後，本視窗將自動消失。</p>
            <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mystic-gold text-black font-bold rounded hover:bg-white transition-colors"
            >
                <ExternalLink size={18} />
                前往 Firebase Console
            </a>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupWizard;
