import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { X, Plus, Trash2, Edit, Save, LogOut, Calendar, FileText, Briefcase, Image as ImageIcon, FolderInput, Loader2, Users, Info, Github, RefreshCw, Printer, CheckCircle, Clock } from 'lucide-react';
import { GalleryItem, Registration } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { 
    news, addNews, updateNews, deleteNews,
    events, addEvent, updateEvent, deleteEvent,
    services, addService, updateService, deleteService,
    gallery, addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
    registrations, updateRegistration, deleteRegistration,
    resetData
  } = useData();

  const [activeTab, setActiveTab] = useState<'NEWS' | 'EVENTS' | 'SERVICES' | 'GALLERY' | 'REGISTRATIONS'>('EVENTS');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // GitHub Import States
  const [showGithubImport, setShowGithubImport] = useState(false);
  const [githubConfig, setGithubConfig] = useState({ owner: '', repo: '', path: 'public/images' });
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  // Local File Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') setIsAuthenticated(true);
    else alert('密碼錯誤 (預設密碼: admin)');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsAdding(false);
  };

  const handleSave = () => {
    if (activeTab === 'NEWS') {
      if (isAdding) addNews(editForm); else updateNews(editingId!, editForm);
    } else if (activeTab === 'EVENTS') {
      if (isAdding) addEvent({
        ...editForm,
        type: editForm.type || 'FESTIVAL',
        description: editForm.description || ''
      }); 
      else updateEvent(editingId!, editForm);
    } else if (activeTab === 'SERVICES') {
      if (isAdding) addService(editForm); else updateService(editingId!, editForm);
    } else if (activeTab === 'GALLERY') {
      if (isAdding) addGalleryItem({
          ...editForm,
          type: editForm.type || 'IMAGE'
      }); else updateGalleryItem(editingId!, editForm);
    } else if (activeTab === 'REGISTRATIONS') {
      updateRegistration(editingId!, editForm);
    }
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  };

  const handleToggleStatus = (reg: Registration) => {
      updateRegistration(reg.id, { isProcessed: !reg.isProcessed });
  };

  const handlePrintReceipt = (reg: Registration) => {
      // Open a wider window for preview
      const printWindow = window.open('', '_blank', 'width=500,height=700');
      if (!printWindow) return;

      const today = new Date();
      const dateStr = `${today.getFullYear()}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getDate().toString().padStart(2,'0')}`;
      const timeStr = `${today.getHours().toString().padStart(2,'0')}:${today.getMinutes().toString().padStart(2,'0')}:${today.getSeconds().toString().padStart(2,'0')}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>收據預覽 - ${reg.name}</title>
            <style>
                /* --- 核心設定：隱藏瀏覽器頁首頁尾 --- */
                @page {
                    size: auto;
                    margin: 0mm; /* 設為 0 會隱藏瀏覽器的標題、網址、頁碼 */
                }

                /* --- 螢幕預覽樣式 --- */
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    background-color: #555; /* 深色背景讓白紙更明顯 */
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 100vh;
                }

                .preview-container {
                    background-color: white;
                    width: 80mm; /* 模擬熱感應紙寬度 (~300px) */
                    padding: 5mm;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    margin-bottom: 20px;
                    position: relative;
                }

                /* 收據內容樣式 */
                .header { text-align: center; margin-bottom: 15px; }
                .title { font-size: 20px; font-weight: bold; letter-spacing: 2px; border-bottom: 2px solid #000; padding-bottom: 5px; display: inline-block; }
                .subtitle { font-size: 14px; margin-top: 5px; font-weight: bold; }
                
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                
                .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
                .table-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 2px; }
                .item-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; font-weight: bold; }
                
                .total-section { text-align: right; margin-top: 15px; font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; }
                
                .footer { text-align: center; font-size: 11px; margin-top: 20px; color: #333; line-height: 1.4; }
                .note { border: 1px solid #000; padding: 5px; margin-bottom: 10px; font-size: 10px; }

                /* --- 操作按鈕區塊 --- */
                .actions-bar {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    padding: 10px 20px;
                    border-radius: 50px;
                    display: flex;
                    gap: 15px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 14px;
                    transition: transform 0.1s;
                }
                .btn:active { transform: scale(0.95); }
                .btn-print { background-color: #C5A059; color: black; }
                .btn-close { background-color: #444; color: white; }

                /* --- 列印專用樣式 (重要) --- */
                @media print {
                    body { 
                        background-color: white; 
                        padding: 0; 
                        margin: 0;
                        display: block;
                    }
                    .preview-container {
                        width: 100%; /* 列印時寬度自適應 */
                        max-width: none;
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                    }
                    /* 隱藏按鈕區 */
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <!-- 模擬紙張區域 -->
            <div class="preview-container">
                <div class="header">
                    <div class="title">新莊武壇廣行宮</div>
                    <div class="subtitle">各項服務收款收據</div>
                </div>
                
                <div class="info-row">
                    <span>單號：${reg.id.substring(reg.id.length - 6)}</span>
                    <span>機台：POS-01</span>
                </div>
                <div class="info-row">
                    <span>日期：${dateStr}</span>
                    <span>時間：${timeStr}</span>
                </div>
                <div class="info-row">
                    <span>信眾：${reg.name}</span>
                    <span>電話：${reg.phone}</span>
                </div>

                <div class="divider"></div>

                <div class="table-header">
                    <span>項目名稱</span>
                    <span>金額</span>
                </div>
                
                <div class="item-row">
                    <span>${reg.serviceTitle}</span>
                    <span>NT$ ${reg.amount}</span>
                </div>
                
                <div class="divider"></div>

                <div class="total-section">
                    總計 NT$ ${reg.amount}
                </div>
                
                <div class="info-row" style="margin-top: 10px;">
                    <span>支付方式：</span>
                    <span>現金/轉帳</span>
                </div>

                <div class="footer">
                    <div class="note">
                        此為宮廟內部收據<br/>
                        僅供證明，不得作為兌獎或報稅憑證
                    </div>
                    <p>感謝您的護持，功德無量。</p>
                    <p>經手人：________________</p>
                </div>
            </div>

            <!-- 操作按鈕 (列印時隱藏) -->
            <div class="actions-bar no-print">
                <button class="btn btn-print" onclick="window.print()">🖨️ 確認列印</button>
                <button class="btn btn-close" onclick="window.close()">關閉視窗</button>
            </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
  };

  // ... (rest of the component logic remains the same)
  
  // 1. Local Simulation Upload
  const triggerFolderUpload = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    setTimeout(() => {
        const newItems: Omit<GalleryItem, 'id'>[] = [];
        Array.from(files).forEach((file: File) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            if (isImage || isVideo) {
                const url = URL.createObjectURL(file);
                const title = file.name.replace(/\.[^/.]+$/, "");
                newItems.push({
                    title: title,
                    type: isVideo ? 'VIDEO' : 'IMAGE',
                    url: url
                });
            }
        });
        if (newItems.length > 0) {
            addGalleryItems(newItems);
            alert(`已暫存 ${newItems.length} 個檔案！\n注意：此方式僅供當前瀏覽器預覽，重新整理後若檔案來源失效可能無法顯示。建議使用 GitHub 匯入功能。`);
        }
        if (event.target) event.target.value = '';
        setIsUploading(false);
    }, 500);
  };

  // 2. GitHub Folder Import Logic
  const handleGithubImport = async () => {
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.path) {
        alert('請填寫完整的 GitHub 資訊');
        return;
    }

    setIsSyncingGithub(true);
    try {
        const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('路徑不是一個資料夾');
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const newItems: Omit<GalleryItem, 'id'>[] = [];

        data.forEach((file: any) => {
            const lowerName = file.name.toLowerCase();
            if (file.type === 'file' && imageExtensions.some(ext => lowerName.endsWith(ext))) {
                newItems.push({
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    type: 'IMAGE',
                    url: file.download_url // Uses raw.githubusercontent.com
                });
            }
        });

        if (newItems.length > 0) {
            addGalleryItems(newItems);
            alert(`成功從 GitHub 匯入 ${newItems.length} 張圖片！`);
            setShowGithubImport(false);
        } else {
            alert('在該資料夾中找不到圖片檔案。');
        }

    } catch (error: any) {
        console.error(error);
        alert(`匯入失敗：${error.message}\n請確認儲存庫為公開 (Public) 且路徑正確。`);
    } finally {
        setIsSyncingGithub(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={32} /></button>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-mystic-charcoal p-8 rounded-sm border border-mystic-gold/30 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">後台管理系統</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="請輸入密碼" className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-mystic-gold text-black font-bold py-3 hover:bg-white transition-colors">登入系統</button>
            <p className="text-xs text-center text-gray-500 mt-4">預設密碼: admin</p>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex text-white font-sans">
      <div className="w-64 bg-mystic-charcoal border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-mystic-gold uppercase tracking-widest">Chi Fu CMS</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'NEWS', icon: FileText, label: '最新消息' },
            { id: 'EVENTS', icon: Calendar, label: '行事曆管理' },
            { id: 'SERVICES', icon: Briefcase, label: '服務項目' },
            { id: 'GALLERY', icon: ImageIcon, label: '活動花絮' },
            { id: 'REGISTRATIONS', icon: Users, label: '報名管理' }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setEditingId(null); setIsAdding(false); setShowGithubImport(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-mystic-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={resetData} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors text-xs"><RefreshCw size={14} /> 重置所有資料</button>
          <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded transition-colors"><LogOut size={18} /> 登出系統</button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto bg-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-white">
            {activeTab === 'REGISTRATIONS' ? '信眾報名清單' : 
             activeTab === 'NEWS' ? '最新消息管理' : 
             activeTab === 'EVENTS' ? '行事曆管理' : 
             activeTab === 'SERVICES' ? '服務項目設定' : '活動花絮管理'}
          </h2>
          <div className="flex flex-wrap gap-3">
             {activeTab === 'GALLERY' && (
                 <>
                    <button onClick={() => setShowGithubImport(!showGithubImport)} className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors">
                        <Github size={18} />
                        {showGithubImport ? '取消匯入' : '從 GitHub 匯入'}
                    </button>

                    <input type="file" ref={fileInputRef} className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} multiple onChange={handleFolderSelect} />
                    <button onClick={triggerFolderUpload} disabled={isUploading} className="bg-blue-900/50 border border-blue-500/50 text-blue-200 px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-900 transition-colors disabled:opacity-50">
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <FolderInput size={18} />}
                        {isUploading ? '匯入中...' : '模擬資料夾上傳'}
                    </button>
                 </>
             )}
            {activeTab !== 'REGISTRATIONS' && (
                <button onClick={() => { setEditingId(null); setIsAdding(true); setShowGithubImport(false); setEditForm(activeTab === 'GALLERY' ? { type: 'IMAGE' } : activeTab === 'NEWS' ? { category: '公告' } : { type: 'FESTIVAL' }); }} className="bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600">
                <Plus size={18} /> 新增項目
                </button>
            )}
          </div>
        </div>

        {/* GitHub Import Panel */}
        {showGithubImport && activeTab === 'GALLERY' && (
             <div className="bg-gray-900 border border-gray-700 p-6 mb-8 rounded-sm animate-fade-in-up">
                 <div className="flex items-center gap-2 mb-4">
                    <Github className="text-white" size={24} />
                    <h3 className="text-lg font-bold text-white">從 GitHub 儲存庫匯入圖片</h3>
                 </div>
                 <p className="text-sm text-gray-400 mb-6">
                    此功能可讓您直接讀取 GitHub 公開儲存庫中的圖片資料夾，並將其加入活動花絮。
                    <br/>請確保您的圖片已上傳至 GitHub (例如: public/gallery 資料夾)。
                 </p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">GitHub 帳號 (Owner)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如: yourname" value={githubConfig.owner} onChange={e => setGithubConfig({...githubConfig, owner: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">儲存庫名稱 (Repo)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如: temple-website" value={githubConfig.repo} onChange={e => setGithubConfig({...githubConfig, repo: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">資料夾路徑 (Path)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如: public/gallery" value={githubConfig.path} onChange={e => setGithubConfig({...githubConfig, path: e.target.value})} />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3">
                    <button onClick={handleGithubImport} disabled={isSyncingGithub} className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isSyncingGithub ? <Loader2 className="animate-spin" size={18} /> : <Github size={18} />}
                        {isSyncingGithub ? '連線讀取中...' : '開始同步匯入'}
                    </button>
                 </div>
             </div>
        )}

        {/* Edit/Add Form */}
        {(editingId || isAdding) && (
          <div className="bg-mystic-charcoal p-6 mb-8 border border-mystic-gold/30 animate-fade-in-up rounded-sm shadow-xl">
             <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <Info size={20} className="text-mystic-gold" />
                <h3 className="text-lg font-bold text-white">{isAdding ? '新增內容' : '編輯內容'}</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === 'REGISTRATIONS' ? (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">信眾姓名</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="姓名" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">電話號碼</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="電話" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                  </>
                ) : activeTab === 'EVENTS' ? (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">活動標題 (法會名稱)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如：池府王爺巡禮" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">國曆日期</label>
                        <input type="date" className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">農曆日期</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如：農曆六月十八" value={editForm.lunarDate || ''} onChange={e => setEditForm({...editForm, lunarDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">活動時間</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="例如：09:00 - 17:00" value={editForm.time || ''} onChange={e => setEditForm({...editForm, time: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">活動類別</label>
                        <select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none cursor-pointer" value={editForm.type || 'FESTIVAL'} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                            <option value="FESTIVAL">慶典 (FESTIVAL)</option>
                            <option value="RITUAL">科儀 (RITUAL)</option>
                            <option value="SERVICE">服務 (SERVICE)</option>
                        </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">活動詳情 / 備註內容</label>
                        <textarea rows={4} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none resize-none" placeholder="請輸入法會或行程的詳細介紹內容..." value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                    </div>
                  </>
                ) : activeTab === 'SERVICES' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">服務名稱</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white" placeholder="服務名稱" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">價格 (緣金)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white" placeholder="價格" type="number" value={editForm.price || ''} onChange={e => setEditForm({...editForm, price: parseInt(e.target.value)})} />
                      </div>
                    </>
                ) : activeTab === 'GALLERY' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">標題</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="活動標題" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">媒體類型</label>
                        <select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none cursor-pointer" value={editForm.type || 'IMAGE'} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                            <option value="IMAGE">圖片 (Image)</option>
                            <option value="VIDEO">影片 (Local Video)</option>
                            <option value="YOUTUBE">YouTube 影片</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">連結網址 (雲端圖片或 YouTube 網址)</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="https://..." value={editForm.url || ''} onChange={e => setEditForm({...editForm, url: e.target.value})} />
                        <p className="text-[10px] text-gray-500 mt-1">
                            * 圖片：請輸入圖片的直接連結 (例如 Google Drive 預覽連結或 GitHub Raw URL)<br/>
                            * YouTube：請輸入完整影片網址 (例如 https://www.youtube.com/watch?v=...)
                        </p>
                      </div>
                    </>
                ) : activeTab === 'NEWS' ? (
                    <>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">公告標題</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="輸入標題" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">發布日期</label>
                        <input 
                          type="date" 
                          className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" 
                          value={editForm.date ? editForm.date.replace(/\./g, '-') : ''} 
                          onChange={e => setEditForm({...editForm, date: e.target.value.replace(/-/g, '.')})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">分類標籤</label>
                        <select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none cursor-pointer" value={editForm.category || '公告'} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                            <option value="公告">公告</option>
                            <option value="法會">法會</option>
                            <option value="慈善">慈善</option>
                            <option value="活動">活動</option>
                            <option value="新聞">新聞</option>
                        </select>
                      </div>
                    </>
                ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">標題</label>
                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" placeholder="標題" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         {/* Other inputs */}
                      </div>
                    </>
                )}
             </div>
             
             <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                <button onClick={handleSave} className="bg-mystic-gold text-black px-8 py-3 rounded-sm font-bold hover:bg-white transition-all shadow-lg">
                    <Save size={18} className="inline-block mr-2 mb-1" /> 儲存變更
                </button>
                <button onClick={() => { setEditingId(null); setIsAdding(false); setEditForm({}); }} className="bg-gray-800 text-white px-8 py-3 rounded-sm hover:bg-gray-700 transition-all">
                    取消
                </button>
             </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-mystic-charcoal rounded overflow-hidden border border-white/5 shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-4">
                  {activeTab === 'EVENTS' ? '活動行程名稱' : '主要資訊'}
                </th>
                <th className="p-4">
                   {activeTab === 'EVENTS' ? '日期與類型' : activeTab === 'REGISTRATIONS' ? '辦理狀態' : '內容詳情'}
                </th>
                <th className="p-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeTab === 'REGISTRATIONS' && registrations.map(reg => (
                <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{reg.name} ({reg.phone})</div>
                    <div className="text-xs text-mystic-gold mb-1">{reg.serviceTitle}</div>
                    <div className="text-[10px] text-gray-500">{reg.city}{reg.district}{reg.road}{reg.addressDetail}</div>
                  </td>
                  <td className="p-4">
                      {/* Status Toggle Button */}
                      <button 
                        onClick={() => handleToggleStatus(reg)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                            reg.isProcessed 
                            ? 'bg-green-900/20 border-green-500/50 text-green-400 hover:bg-green-900/40' 
                            : 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40'
                        }`}
                      >
                          {reg.isProcessed ? <CheckCircle size={14} /> : <Clock size={14} />}
                          <span className="text-xs font-bold">{reg.isProcessed ? '已圓滿' : '未辦理'}</span>
                      </button>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2 items-center">
                    <button onClick={() => handlePrintReceipt(reg)} className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors" title="列印收據"><Printer size={16}/></button>
                    <button onClick={() => handleEdit(reg)} className="p-2 bg-blue-900/20 text-blue-400 rounded hover:bg-blue-900/40 transition-colors"><Edit size={16}/></button>
                    <button onClick={() => deleteRegistration(reg.id)} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              
              {activeTab === 'EVENTS' && events.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white text-base">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[300px]">{item.description}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-200">{item.date} <span className="text-xs text-gray-500">({item.lunarDate})</span></div>
                    <div className="mt-1 flex items-center gap-2">
                         <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold ${
                             item.type === 'FESTIVAL' ? 'bg-red-900/40 text-red-400 border border-red-900/60' : 
                             item.type === 'RITUAL' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/60' : 
                             'bg-green-900/40 text-green-400 border border-green-900/60'
                         }`}>
                             {item.type === 'FESTIVAL' ? '慶典' : item.type === 'RITUAL' ? '科儀' : '服務'}
                         </span>
                         <span className="text-xs text-mystic-gold">{item.time}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2 pt-6">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded hover:bg-blue-900/40 transition-colors"><Edit size={16}/></button>
                    <button onClick={() => deleteEvent(item.id)} className="p-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'NEWS' && news.map(item => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{item.title}</td>
                  <td className="p-4 text-gray-400">{item.date} | {item.category}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16}/></button>
                    <button onClick={() => deleteNews(item.id!)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              
              {activeTab === 'SERVICES' && services.map(item => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{item.title}</td>
                  <td className="p-4 text-gray-400">${item.price} | {item.type}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16}/></button>
                    <button onClick={() => deleteService(item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'GALLERY' && gallery.map(item => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {item.type === 'IMAGE' ? (
                             <img src={item.url} alt="thumb" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Error')} />
                        ) : item.type === 'YOUTUBE' ? (
                             <div className="w-full h-full bg-red-900/50 flex items-center justify-center text-red-500">YT</div>
                        ) : (
                             <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">Vid</div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-white truncate max-w-[200px]">{item.title}</div>
                        <div className="text-[10px] text-gray-600 truncate max-w-[200px]">{item.url}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${item.type === 'YOUTUBE' ? 'border-red-500 text-red-500' : 'border-gray-500'}`}>
                          {item.type}
                      </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16}/></button>
                    <button onClick={() => deleteGalleryItem(item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {((activeTab === 'REGISTRATIONS' && registrations.length === 0) || 
             (activeTab === 'EVENTS' && events.length === 0) ||
             (activeTab === 'GALLERY' && gallery.length === 0) ||
             (activeTab === 'NEWS' && news.length === 0)) && (
            <div className="p-12 text-center text-gray-600">目前暫無資料</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;