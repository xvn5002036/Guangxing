
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { supabase } from '../services/supabase'; // Import Supabase Client
import { X, Plus, Trash2, Edit, Save, LogOut, Calendar, FileText, Briefcase, Image as ImageIcon, FolderInput, Loader2, Users, Info, Github, RefreshCw, Printer, Settings, Layout, Network, HelpCircle, Home, HeartHandshake, Sun } from 'lucide-react';
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
        orgMembers, addOrgMember, updateOrgMember, deleteOrgMember,
        faqs, addFaq, updateFaq, deleteFaq,
        siteSettings, updateSiteSettings,
        resetData
    } = useData();

    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GENERAL' | 'NEWS' | 'EVENTS' | 'SERVICES' | 'GALLERY' | 'REGISTRATIONS' | 'ORG' | 'FAQS'>('DASHBOARD');
    const [generalSubTab, setGeneralSubTab] = useState<'VISUAL' | 'CONFIG'>('VISUAL');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { user, userProfile, fetchUserProfile } = useData(); // Get global user state

    // New local state to force UI update immediately after login verification
    const [forceDashboard, setForceDashboard] = useState(false);

    // Admin UI States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [isAdding, setIsAdding] = useState(false);

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Generic Delete Handler
    const handleDelete = async (type: 'NEWS' | 'EVENT' | 'SERVICE' | 'GALLERY' | 'ORG' | 'FAQ' | 'REGISTRATION', id: string) => {
        if (!window.confirm('確定要刪除此項目嗎？此動作無法復原。')) return;

        try {
            if (type === 'NEWS') await deleteNews(id);
            else if (type === 'EVENT') await deleteEvent(id);
            else if (type === 'SERVICE') await deleteService(id);
            else if (type === 'GALLERY') await deleteGalleryItem(id);
            else if (type === 'ORG') await deleteOrgMember(id);
            else if (type === 'FAQ') await deleteFaq(id);
            else if (type === 'REGISTRATION') await deleteRegistration(id);
        } catch (error: any) {
            console.error("Delete failed:", error);
            if (error.code === '23503') { // Foreign Key Violation
                alert('無法刪除：此項目已被其他資料引用 (例如已有人報名此活動)。\n請先刪除相關聯的資料後再試。');
            } else {
                alert(`刪除失敗：${error.message || '未知錯誤'}`);
            }
        }
    };

    // REGISTRATIONS Filter & Export Logic
    const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');

    const handleExportCSV = () => {
        // Filter data based on current selection
        const dataToExport = selectedEventFilter === 'ALL'
            ? registrations
            : registrations.filter(r => r.serviceTitle === selectedEventFilter);

        if (dataToExport.length === 0) {
            alert('目前無資料可匯出');
            return;
        }

        // CSV Header
        const headers = ["報名編號", "日期", "活動/服務名稱", "信眾姓名", "電話", "農曆年", "農曆月", "農曆日", "農曆時", "地址", "金額", "狀態", "備註"];

        // CSV Rows
        const rows = dataToExport.map(reg => [
            `'${reg.id.substring(reg.id.length - 6)}`, // Add ' to force string in Excel to keep leading zeros if any
            new Date(reg.createdAt).toLocaleDateString(),
            reg.serviceTitle,
            reg.name,
            reg.phone,
            reg.birthYear || '',
            reg.birthMonth || '',
            reg.birthDay || '',
            reg.birthHour || '',
            `${reg.city}${reg.district}${reg.road || ''}${reg.addressDetail || ''}`,
            reg.amount,
            reg.isProcessed ? '已辦理' : '未辦理',
            reg.paymentMethod || ''
        ]);

        // Combine into CSV string with BOM for UTF-8 (Excel Chinese support)
        const csvContent = "\uFEFF" + [
            headers.join(","),
            ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `法會報名名單_${selectedEventFilter === 'ALL' ? '全部' : selectedEventFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Batch Selection State
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Helper to get unique event titles for the filter dropdown
    const uniqueEventTitles = Array.from(new Set([
        ...events.map(e => e.title),
        ...services.map(s => s.title)
    ]));

    // Filter Logic: 1. Event Type -> 2. Search Term
    const filteredRegistrations = activeTab === 'REGISTRATIONS'
        ? registrations.filter(r => {
            const matchesEvent = selectedEventFilter === 'ALL' || r.serviceTitle === selectedEventFilter;
            const matchesSearch = searchTerm === '' ||
                r.name.includes(searchTerm) ||
                r.phone.includes(searchTerm) ||
                (r.bankLastFive && r.bankLastFive.includes(searchTerm));
            return matchesEvent && matchesSearch;
        })
        : [];

    // Dashboard Statistics Calculation
    const stats = {
        totalRevenue: registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0),
        registrationsCount: registrations.length,
        unprocessedCount: registrations.filter(r => !r.isProcessed).length,
        todayNewCount: registrations.filter(r => {
            const today = new Date();
            const regDate = new Date(r.createdAt);
            return regDate.getDate() === today.getDate() &&
                regDate.getMonth() === today.getMonth() &&
                regDate.getFullYear() === today.getFullYear();
        }).length
    };

    // Recent 5 Registrations
    const recentRegistrations = [...registrations]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);


    // Pagination Logic
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const paginatedRegistrations = filteredRegistrations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Batch Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Select all currently filtered items (not just current page, usually expected behavior in admins, or just page? Let's do all filtered for bulk ops)
            // User requested "batch delete", often implies all matching. But to be safe lets select all visible on current filter.
            setSelectedItems(new Set(filteredRegistrations.map(r => r.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedItems(newSet);
    };

    const handleBatchDelete = async () => {
        if (selectedItems.size === 0) return;

        if (window.confirm(`確定要刪除選取的 ${selectedItems.size} 筆資料嗎？此動作無法復原。`)) {
            let successCount = 0;
            let failCount = 0;

            for (const id of Array.from(selectedItems)) {
                try {
                    await deleteRegistration(id);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to delete registration ${id}:`, error);
                    failCount++;
                }
            }

            setSelectedItems(new Set());
            // Adjust page if empty
            if (currentPage > 1 && paginatedRegistrations.length === selectedItems.size && filteredRegistrations.length === selectedItems.size) {
                setCurrentPage(prev => Math.max(1, prev - 1));
            }

            if (failCount > 0) {
                alert(`批次處理完成。成功刪除: ${successCount} 筆，失敗: ${failCount} 筆。\n(失敗原因通常是網路問題或資料庫限制)`);
            } else {
                alert('已完成批次刪除');
            }
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedItems(new Set());
    }, [selectedEventFilter, searchTerm, activeTab]);

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState(siteSettings);

    // GitHub Import States
    const [showGithubImport, setShowGithubImport] = useState(false);
    const [githubConfig, setGithubConfig] = useState({ owner: '', repo: '', path: 'public/images' });
    const [isSyncingGithub, setIsSyncingGithub] = useState(false);

    // Local File Upload States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize settings form when loading or switching tabs
    useEffect(() => {
        setSettingsForm({
            ...siteSettings,
            // Ensure nested objects are initialized if missing (fallback)
            configDonation: siteSettings.configDonation || { showBirth: false, showTime: false, showAddress: false, showIdNumber: false },
            configLight: siteSettings.configLight || { showBirth: true, showTime: true, showAddress: true, showIdNumber: false },
            configEvent: siteSettings.configEvent || { showBirth: true, showTime: false, showAddress: true, showIdNumber: true }
        });
    }, [siteSettings, activeTab]);

    // Derived state for determining if we should show the dashboard
    // We trust the Context (isAdmin) OR our local override (forceDashboard)
    const isAdmin = (user && userProfile?.role === 'admin') || forceDashboard;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError(null);
        console.log("Starting login process...", { email });

        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out')), 10000)
            );

            // Race the auth request against the timeout
            const { data, error } = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                timeoutPromise
            ]) as any;

            if (error) throw error;

            console.log("Supabase Auth Successful", data);
            // Auth successful, wait for DataContext to update userProfile and check role
            // We force a fetch here to ensure UI updates immediately
            await fetchUserProfile(data.user.id);

            // We can do a quick one-off check here to give immediate feedback
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError || profileData?.role !== 'admin') {
                console.warn("Login denied: Profile check failed", { profileError, role: profileData?.role });

                let detail = '';
                if (profileError) detail = `資料庫錯誤: ${profileError.message} (${profileError.code})`;
                else if (!profileData) detail = '找不到會員資料 (ID 不匹配?)';
                else detail = `角色權限: ${profileData.role || '無'} (需要: admin)`;

                await supabase.auth.signOut();
                throw new Error(`登入失敗 (檢查階段):\n${detail}`);
            } else {
                console.log("Login authorized! Role is admin.");
                // SUCCESS: Force local state to switch UI immediately
                setForceDashboard(true);
            }

        } catch (err: any) {
            console.error("Login Error:", err);
            // Translate common errors
            let msg = err.message;
            if (msg === 'Invalid login credentials') msg = '帳號或密碼錯誤';
            else if (msg.includes('Login timed out')) msg = '登入連線逾時，請檢查網路';

            setLoginError(msg);

            // Only alert for non-credential errors to avoid annoyance
            if (msg !== '帳號或密碼錯誤' && !msg.includes('權限')) {
                alert(`登入發生意外錯誤：\n${msg}`);
            } else if (msg.includes('權限')) {
                alert(msg); // Alert for permission issues is helpful
            }

        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({ ...item });
        setIsAdding(false);
    };

    const handleSave = async () => {
        try {
            if (activeTab === 'NEWS') {
                if (isAdding) await addNews(editForm); else await updateNews(editingId!, editForm);
            } else if (activeTab === 'EVENTS') {
                if (isAdding) await addEvent({
                    ...editForm,
                    type: editForm.type || 'FESTIVAL',
                    description: editForm.description || ''
                });
                else await updateEvent(editingId!, editForm);
            } else if (activeTab === 'SERVICES') {
                if (isAdding) await addService(editForm); else await updateService(editingId!, editForm);
            } else if (activeTab === 'GALLERY') {
                if (isAdding) await addGalleryItem({
                    ...editForm,
                    type: editForm.type || 'IMAGE'
                }); else await updateGalleryItem(editingId!, editForm);
            } else if (activeTab === 'REGISTRATIONS') {
                await updateRegistration(editingId!, editForm);
            } else if (activeTab === 'ORG') {
                if (isAdding) await addOrgMember({
                    ...editForm,
                    category: editForm.category || 'STAFF'
                }); else await updateOrgMember(editingId!, editForm);
            } else if (activeTab === 'FAQS') {
                if (isAdding) await addFaq(editForm); else await updateFaq(editingId!, editForm);
            }
            // Success
            setEditingId(null);
            setIsAdding(false);
            setEditForm({});
        } catch (error: any) {
            console.error("Save failed:", error);
            // Translate common schema errors
            let msg = error.message || '未知錯誤';
            if (msg.includes('field_config')) {
                msg = '資料庫架構尚未更新，缺少 "field_config" 欄位。\n請執行 walkthrough.md 中的 SQL 遷移指令。';
            }
            alert(`儲存失敗：\n${msg}`);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await updateSiteSettings(settingsForm);
            alert('網站設定已更新！');
        } catch (error) {
            console.error("Save settings error:", error);
            alert('儲存失敗，請檢查網路或權限');
        }
    };

    const handleToggleStatus = (reg: Registration) => {
        updateRegistration(reg.id, { isProcessed: !reg.isProcessed });
    };

    const handlePrintReceipt = (reg: Registration) => {
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (!printWindow) return;

        const today = new Date();
        const dateStr = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
        const timeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

        const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>收據預覽 - ${reg.name}</title>
            <style>
                @page { size: auto; margin: 0mm; }
                body { font-family: 'Courier New', Courier, monospace; background-color: #555; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
                .preview-container { background-color: white; width: 80mm; padding: 5mm; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 20px; position: relative; }
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
                .actions-bar { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); padding: 10px 20px; border-radius: 50px; display: flex; gap: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                .btn { padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 14px; transition: transform 0.1s; }
                .btn:active { transform: scale(0.95); }
                .btn-print { background-color: #C5A059; color: black; }
                .btn-close { background-color: #444; color: white; }
                @media print { body { background-color: white; padding: 0; margin: 0; display: block; } .preview-container { width: 100%; max-width: none; box-shadow: none; margin: 0; padding: 0; } .no-print { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="preview-container">
                <div class="header"><div class="title">新莊武壇廣行宮</div><div class="subtitle">各項服務收款收據</div></div>
                <div class="info-row"><span>單號：${reg.id.substring(reg.id.length - 6)}</span><span>機台：POS-01</span></div>
                <div class="info-row"><span>日期：${dateStr}</span><span>時間：${timeStr}</span></div>
                <div class="info-row"><span>信眾：${reg.name}</span><span>電話：${reg.phone}</span></div>
                <div class="divider"></div>
                <div class="table-header"><span>項目名稱</span><span>金額</span></div>
                <div class="item-row"><span>${reg.serviceTitle}</span><span>NT$ ${reg.amount}</span></div>
                <div class="divider"></div>
                <div class="total-section">總計 NT$ ${reg.amount}</div>
                <div class="info-row" style="margin-top: 10px;"><span>支付方式：</span><span>現金/轉帳</span></div>
                <div class="footer"><div class="note">此為宮廟內部收據<br/>僅供證明，不得作為兌獎或報稅憑證</div><p>感謝您的護持，功德無量。</p><p>經手人：________________</p></div>
            </div>
            <div class="actions-bar no-print"><button class="btn btn-print" onclick="window.print()">🖨️ 確認列印</button><button class="btn btn-close" onclick="window.close()">關閉視窗</button></div>
        </body>
        </html>
      `;

        printWindow.document.write(fullHtml);
        printWindow.document.close();
    };

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
                alert(`已暫存 ${newItems.length} 個檔案！`);
            }
            if (event.target) event.target.value = '';
            setIsUploading(false);
        }, 500);
    };

    const handleGithubImport = async () => {
        if (!githubConfig.owner || !githubConfig.repo || !githubConfig.path) {
            alert('請填寫完整的 GitHub 資訊');
            return;
        }

        setIsSyncingGithub(true);
        try {
            const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.path}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('路徑不是一個資料夾');

            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const newItems: Omit<GalleryItem, 'id'>[] = [];

            data.forEach((file: any) => {
                const lowerName = file.name.toLowerCase();
                if (file.type === 'file' && imageExtensions.some(ext => lowerName.endsWith(ext))) {
                    newItems.push({
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        type: 'IMAGE',
                        url: file.download_url
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
            alert(`匯入失敗：${error.message}`);
        } finally {
            setIsSyncingGithub(false);
        }
    };

    if (!isAdmin) return (
        <div className="fixed inset-0 z-[100] bg-black">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={32} /></button>
            <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-mystic-charcoal p-8 rounded-sm border border-mystic-gold/30 w-full max-w-md shadow-2xl animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-widest">後台管理系統</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase block mb-1">管理員帳號 (Email)</label>
                            <input
                                type="email"
                                required
                                placeholder="admin@example.com"
                                className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase block mb-1">登入密碼</label>
                            <input
                                type="password"
                                required
                                placeholder="請輸入密碼"
                                className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {loginError && (
                            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 text-sm flex items-center gap-2 rounded">
                                <Info size={16} />
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full bg-mystic-gold text-black font-bold py-3 hover:bg-white transition-colors disabled:opacity-50 flex justify-center gap-2"
                        >
                            {isLoggingIn && <Loader2 className="animate-spin" size={20} />}
                            {isLoggingIn ? '驗證權限中...' : '登入系統'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row text-white font-sans h-screen overflow-hidden">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-mystic-charcoal border-b border-white/5 z-40">
                <h2 className="text-lg font-bold text-mystic-gold uppercase tracking-widest">Chi Fu CMS</h2>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-white p-2 hover:bg-white/10 rounded"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Home size={24} />} {/* Using Home icon as Menu or just Menu logic */}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-mystic-charcoal border-r border-white/5 flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:inset-auto md:h-full
            `}>
                <div className="p-6 border-b border-white/5 hidden md:block">
                    <h2 className="text-xl font-bold text-mystic-gold uppercase tracking-widest">Chi Fu CMS</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {[
                        { id: 'DASHBOARD', icon: Layout, label: '總覽/儀表板' },
                        { id: 'GENERAL', icon: Settings, label: '一般設定' },
                        { id: 'ORG', icon: Network, label: '組織管理' },
                        { id: 'NEWS', icon: FileText, label: '最新消息' },
                        { id: 'EVENTS', icon: Calendar, label: '行事曆管理' },
                        { id: 'SERVICES', icon: Briefcase, label: '服務項目' },
                        { id: 'GALLERY', icon: ImageIcon, label: '活動花絮' },
                        { id: 'FAQS', icon: HelpCircle, label: '常見問題' },
                        { id: 'REGISTRATIONS', icon: Users, label: '報名管理' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => {
                            setActiveTab(tab.id as any);
                            setEditingId(null);
                            setIsAdding(false);
                            setShowGithubImport(false);
                            setIsMobileMenuOpen(false); // Close on selection
                        }} className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-mystic-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/5 space-y-2 bg-mystic-charcoal">
                    <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors text-xs"><Home size={14} /> 回首頁</button>
                    <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded transition-colors"><LogOut size={18} /> 登出系統</button>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-black w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        {activeTab === 'DASHBOARD' ? '後台管理總覽 (Dashboard)' :
                            activeTab === 'GENERAL' ? '一般網站設定 (圖片與文字)' :
                                activeTab === 'ORG' ? '宮廟組織人員管理' :
                                    activeTab === 'REGISTRATIONS' ? '信眾報名清單' :
                                        activeTab === 'NEWS' ? '最新消息管理' :
                                            activeTab === 'EVENTS' ? '行事曆管理' :
                                                activeTab === 'SERVICES' ? '服務項目設定' :
                                                    activeTab === 'FAQS' ? '常見問題管理' : '活動花絮管理'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {activeTab === 'GALLERY' && (
                            <>
                                <button onClick={() => setShowGithubImport(!showGithubImport)} className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700 transition-colors">
                                    <Github size={18} />
                                    {showGithubImport ? '取消' : 'GitHub 匯入'}
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} multiple onChange={handleFolderSelect} />
                                <button onClick={triggerFolderUpload} disabled={isUploading} className="bg-blue-900/50 border border-blue-500/50 text-blue-200 px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-900 transition-colors disabled:opacity-50">
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <FolderInput size={18} />}
                                    {isUploading ? '處理中...' : '模擬上傳'}
                                </button>
                            </>
                        )}
                        {activeTab !== 'REGISTRATIONS' && activeTab !== 'GENERAL' && activeTab !== 'DASHBOARD' && (
                            <button onClick={() => { setEditingId(null); setIsAdding(true); setShowGithubImport(false); setEditForm(activeTab === 'GALLERY' ? { type: 'IMAGE' } : activeTab === 'NEWS' ? { category: '公告' } : activeTab === 'ORG' ? { category: 'STAFF' } : activeTab === 'FAQS' ? {} : { type: 'FESTIVAL' }); }} className="bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600">
                                <Plus size={18} /> 新增項目
                            </button>
                        )}
                    </div>
                </div>

                {/* --- DASHBOARD TAB --- */}
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-mystic-charcoal p-6 rounded-sm border border-white/10 relative overflow-hidden group hover:border-mystic-gold/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={64} />
                                </div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">總報名人數</h3>
                                <div className="text-3xl font-bold text-white">{stats.registrationsCount} <span className="text-sm font-normal text-gray-500">人</span></div>
                            </div>
                            <div className="bg-mystic-charcoal p-6 rounded-sm border border-white/10 relative overflow-hidden group hover:border-mystic-gold/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Briefcase size={64} />
                                </div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">今日新增報名</h3>
                                <div className="text-3xl font-bold text-green-400">+{stats.todayNewCount} <span className="text-sm font-normal text-gray-500">人</span></div>
                            </div>
                            <div className="bg-mystic-charcoal p-6 rounded-sm border border-white/10 relative overflow-hidden group hover:border-mystic-gold/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Settings size={64} />
                                </div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">未辦理案件</h3>
                                <div className="text-3xl font-bold text-red-400">{stats.unprocessedCount} <span className="text-sm font-normal text-gray-500">件</span></div>
                            </div>
                            <div className="bg-mystic-charcoal p-6 rounded-sm border border-white/10 relative overflow-hidden group hover:border-mystic-gold/50 transition-colors">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Network size={64} />
                                </div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">總金額 (Total Revenue)</h3>
                                <div className="text-3xl font-bold text-mystic-gold">NT$ {stats.totalRevenue.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-mystic-charcoal border border-white/10 rounded-sm p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-mystic-gold"></div>
                                最新報名動態
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-black/20 text-gray-400 uppercase tracking-widest text-xs">
                                        <tr>
                                            <th className="p-4">時間</th>
                                            <th className="p-4">信眾姓名</th>
                                            <th className="p-4">服務項目</th>
                                            <th className="p-4">金額</th>
                                            <th className="p-4 text-right">狀態</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {recentRegistrations.length > 0 ? recentRegistrations.map(reg => (
                                            <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-gray-400">{new Date(reg.createdAt).toLocaleDateString()} {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="p-4 font-bold text-white">{reg.name}</td>
                                                <td className="p-4 text-gray-300">{reg.serviceTitle}</td>
                                                <td className="p-4 font-mono text-mystic-gold">NT$ {reg.amount}</td>
                                                <td className="p-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-xs ${reg.isProcessed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                        {reg.isProcessed ? '已辦理' : '未辦理'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">目前尚無任何報名資料</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 text-center">
                                <button onClick={() => setActiveTab('REGISTRATIONS')} className="text-xs text-gray-400 hover:text-white border-b border-dashed border-gray-600 hover:border-white pb-0.5 transition-all">
                                    查看所有報名紀錄
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- GENERAL SETTINGS TAB --- */}
                {activeTab === 'GENERAL' && (
                    <div className="bg-mystic-charcoal p-8 border border-white/5 rounded-sm shadow-xl max-w-4xl animate-fade-in-up">
                        {/* ... (Existing General Settings Code) ... */}


                        <div className="space-y-8 animate-fade-in-up">
                            {/* Basic Info */}
                            <div>
                                <h4 className="text-sm text-mystic-gold font-bold mb-4 uppercase tracking-widest border-l-2 border-mystic-gold pl-2">宮廟基本資訊</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">宮廟名稱</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.templeName} onChange={e => setSettingsForm({ ...settingsForm, templeName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">聯絡電話</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.phone} onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">地址</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.address} onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-green-500 uppercase font-bold">LINE 官方帳號連結</label>
                                        <input className="w-full bg-black border border-green-900/50 p-3 text-green-400 focus:border-green-500 outline-none" value={settingsForm.lineUrl} onChange={e => setSettingsForm({ ...settingsForm, lineUrl: e.target.value })} placeholder="https://line.me/..." />
                                    </div>
                                </div>
                            </div>

                            {/* Hero Section */}
                            <div>
                                <h4 className="text-sm text-mystic-gold font-bold mb-4 uppercase tracking-widest border-l-2 border-mystic-gold pl-2">首頁主視覺 (Hero)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">主標題</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.heroTitle} onChange={e => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">副標題</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.heroSubtitle} onChange={e => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })} />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs text-gray-500 uppercase">背景圖片連結 (URL)</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.heroImage} onChange={e => setSettingsForm({ ...settingsForm, heroImage: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Deity Info */}
                            <div>
                                <h4 className="text-sm text-mystic-gold font-bold mb-4 uppercase tracking-widest border-l-2 border-mystic-gold pl-2">神尊介紹 (Deity Info)</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">神像圖片連結 (URL)</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityImage} onChange={e => setSettingsForm({ ...settingsForm, deityImage: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">主標題</label>
                                        <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityTitle} onChange={e => setSettingsForm({ ...settingsForm, deityTitle: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase">傳奇緣起 (介紹內文)</label>
                                        <textarea rows={6} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none resize-none" value={settingsForm.deityIntro} onChange={e => setSettingsForm({ ...settingsForm, deityIntro: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">方塊 1：聖誕日期</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityBirthday} onChange={e => setSettingsForm({ ...settingsForm, deityBirthday: e.target.value })} placeholder="例如：農曆六月十八" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">方塊 1：說明標籤</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityBirthdayLabel} onChange={e => setSettingsForm({ ...settingsForm, deityBirthdayLabel: e.target.value })} placeholder="例如：聖誕千秋" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">方塊 2：職責</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityDuty} onChange={e => setSettingsForm({ ...settingsForm, deityDuty: e.target.value })} placeholder="例如：消災 · 解厄" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">方塊 2：說明標籤</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.deityDutyLabel} onChange={e => setSettingsForm({ ...settingsForm, deityDutyLabel: e.target.value })} placeholder="例如：專司職責" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History Images & Text */}
                            <div>
                                <h4 className="text-sm text-mystic-gold font-bold mb-4 uppercase tracking-widest border-l-2 border-mystic-gold pl-2">宮廟沿革設定 (History Section)</h4>

                                {/* Roof Section */}
                                <div className="mb-6 border border-white/5 p-4 rounded bg-black/20">
                                    <h5 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">宮廟主神資訊</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">主神聖像 (URL)</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyImageRoof} onChange={e => setSettingsForm({ ...settingsForm, historyImageRoof: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">標題</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyRoofTitle} onChange={e => setSettingsForm({ ...settingsForm, historyRoofTitle: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">描述</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyRoofDesc} onChange={e => setSettingsForm({ ...settingsForm, historyRoofDesc: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stone Section */}
                                <div className="border border-white/5 p-4 rounded bg-black/20">
                                    <h5 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">區塊 2：龍柱石雕</h5>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-500 uppercase">圖片連結</label>
                                            <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyImageStone} onChange={e => setSettingsForm({ ...settingsForm, historyImageStone: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">標題</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyStoneTitle} onChange={e => setSettingsForm({ ...settingsForm, historyStoneTitle: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">描述</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyStoneDesc} onChange={e => setSettingsForm({ ...settingsForm, historyStoneDesc: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Sections */}
                                <div className="mt-6 space-y-6">
                                    <div className="border border-white/5 p-4 rounded bg-black/20">
                                        <h5 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">沿革時間軸 1 (草創)</h5>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">標題</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyTitle1} onChange={e => setSettingsForm({ ...settingsForm, historyTitle1: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">內容</label>
                                                <textarea rows={3} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none resize-none" value={settingsForm.historyDesc1} onChange={e => setSettingsForm({ ...settingsForm, historyDesc1: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-white/5 p-4 rounded bg-black/20">
                                        <h5 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">沿革時間軸 2 (建廟)</h5>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">標題</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyTitle2} onChange={e => setSettingsForm({ ...settingsForm, historyTitle2: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">內容</label>
                                                <textarea rows={3} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none resize-none" value={settingsForm.historyDesc2} onChange={e => setSettingsForm({ ...settingsForm, historyDesc2: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-white/5 p-4 rounded bg-black/20">
                                        <h5 className="text-xs font-bold text-gray-400 mb-3 border-b border-white/5 pb-2">沿革時間軸 3 (現代)</h5>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">標題</label>
                                                <input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={settingsForm.historyTitle3} onChange={e => setSettingsForm({ ...settingsForm, historyTitle3: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-gray-500 uppercase">內容</label>
                                                <textarea rows={3} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none resize-none" value={settingsForm.historyDesc3} onChange={e => setSettingsForm({ ...settingsForm, historyDesc3: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>




                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button onClick={handleSaveSettings} className="bg-mystic-gold text-black px-8 py-3 rounded-sm font-bold hover:bg-white transition-all shadow-lg flex items-center gap-2">
                                <Save size={18} /> 儲存所有設定
                            </button>
                        </div>
                    </div>
                )}

                {/* --- OTHER TABS CONTENT --- */}
                {activeTab !== 'GENERAL' && (
                    <>
                        {/* GitHub Import Panel */}
                        {showGithubImport && activeTab === 'GALLERY' && (
                            <div className="bg-gray-900 border border-gray-700 p-6 mb-8 rounded-sm animate-fade-in-up">
                                {/* ... (Github Import UI) ... */}
                                <div className="flex items-center gap-2 mb-4"><Github className="text-white" size={24} /><h3 className="text-lg font-bold text-white">從 GitHub 儲存庫匯入圖片</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">GitHub 帳號 (Owner)</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={githubConfig.owner} onChange={e => setGithubConfig({ ...githubConfig, owner: e.target.value })} /></div>
                                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">儲存庫名稱 (Repo)</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={githubConfig.repo} onChange={e => setGithubConfig({ ...githubConfig, repo: e.target.value })} /></div>
                                    <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">資料夾路徑 (Path)</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={githubConfig.path} onChange={e => setGithubConfig({ ...githubConfig, path: e.target.value })} /></div>
                                </div>
                                <div className="flex justify-end gap-3"><button onClick={handleGithubImport} disabled={isSyncingGithub} className="bg-white text-black px-6 py-2 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50">{isSyncingGithub ? <Loader2 className="animate-spin" size={18} /> : <Github size={18} />}{isSyncingGithub ? '連線讀取中...' : '開始同步匯入'}</button></div>
                            </div>
                        )}

                        {/* Edit/Add Form */}
                        {(editingId || isAdding) && (
                            <div className="bg-mystic-charcoal p-6 mb-8 border border-mystic-gold/30 animate-fade-in-up rounded-sm shadow-xl">
                                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><Info size={20} className="text-mystic-gold" /><h3 className="text-lg font-bold text-white">{isAdding ? '新增內容' : '編輯內容'}</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeTab === 'REGISTRATIONS' ? (
                                        <>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">信眾姓名</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">電話號碼</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                                        </>
                                    ) : activeTab === 'EVENTS' ? (
                                        <>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">活動標題</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">國曆日期 (Date)</label><input type="date" className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.date ? editForm.date.replace(/\./g, '-') : ''} onChange={e => setEditForm({ ...editForm, date: e.target.value.replace(/-/g, '.') })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">農曆日期 (Lunar Date)</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.lunarDate || ''} onChange={e => setEditForm({ ...editForm, lunarDate: e.target.value })} placeholder="例如: 九月十五" /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">時間 (Time)</label><input type="time" className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.time || ''} onChange={e => setEditForm({ ...editForm, time: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">類別</label><select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.type || 'FESTIVAL'} onChange={e => setEditForm({ ...editForm, type: e.target.value })}><option value="FESTIVAL">慶典</option><option value="RITUAL">科儀</option><option value="SERVICE">服務</option></select></div>
                                            <div className="space-y-1 md:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-widest">詳情</label><textarea rows={4} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>

                                            {/* Field Config for Events */}
                                            <div className="md:col-span-2 bg-black/40 p-4 border border-white/10 rounded">
                                                <h5 className="text-xs text-mystic-gold uppercase tracking-widest font-bold mb-3 border-b border-white/10 pb-2">表單欄位設定</h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {[{ key: 'showBirth', label: '農曆生辰' }, { key: 'showTime', label: '出生時辰' }, { key: 'showAddress', label: '通訊地址' }, { key: 'showIdNumber', label: '身分證字號' }].map(field => {
                                                        const config = editForm.fieldConfig || {};
                                                        return (
                                                            <div key={field.key} className="flex flex-col gap-2">
                                                                <span className="text-xs text-gray-400">{field.label}</span>
                                                                <div
                                                                    onClick={() => setEditForm({ ...editForm, fieldConfig: { ...config, [field.key]: !config[field.key] } })}
                                                                    className={`w-10 h-6 rounded-full cursor-pointer transition-colors p-1 ${config[field.key] ? 'bg-green-600' : 'bg-gray-700'}`}
                                                                >
                                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config[field.key] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : activeTab === 'SERVICES' ? (
                                        <>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">服務名稱</label><input className="w-full bg-black border border-white/10 p-3 text-white" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">價格</label><input className="w-full bg-black border border-white/10 p-3 text-white" type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">類別</label><select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.type || 'LIGHT'} onChange={e => setEditForm({ ...editForm, type: e.target.value })}><option value="LIGHT">點燈 (Light)</option><option value="RITUAL">科儀 (Ritual)</option><option value="DONATION">捐獻 (Donation)</option></select></div>

                                            {/* Field Config for Services */}
                                            <div className="md:col-span-2 bg-black/40 p-4 border border-white/10 rounded">
                                                <h5 className="text-xs text-mystic-gold uppercase tracking-widest font-bold mb-3 border-b border-white/10 pb-2">表單欄位設定</h5>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {[{ key: 'showBirth', label: '農曆生辰' }, { key: 'showTime', label: '出生時辰' }, { key: 'showAddress', label: '通訊地址' }, { key: 'showIdNumber', label: '身分證字號' }].map(field => {
                                                        const config = editForm.fieldConfig || {};
                                                        return (
                                                            <div key={field.key} className="flex flex-col gap-2">
                                                                <span className="text-xs text-gray-400">{field.label}</span>
                                                                <div
                                                                    onClick={() => setEditForm({ ...editForm, fieldConfig: { ...config, [field.key]: !config[field.key] } })}
                                                                    className={`w-10 h-6 rounded-full cursor-pointer transition-colors p-1 ${config[field.key] ? 'bg-green-600' : 'bg-gray-700'}`}
                                                                >
                                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config[field.key] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    ) : activeTab === 'NEWS' ? (
                                        <>
                                            <div className="space-y-1 md:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-widest">標題</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">日期</label><input type="date" className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.date ? editForm.date.replace(/\./g, '-') : ''} onChange={e => setEditForm({ ...editForm, date: e.target.value.replace(/-/g, '.') })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">分類</label><select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.category || '公告'} onChange={e => setEditForm({ ...editForm, category: e.target.value })}><option value="公告">公告</option><option value="法會">法會</option><option value="慈善">慈善</option></select></div>
                                        </>
                                    ) : activeTab === 'ORG' ? (
                                        <>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">人員姓名</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">職位名稱</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">照片連結</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.image || ''} onChange={e => setEditForm({ ...editForm, image: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">組織層級</label><select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.category || 'STAFF'} onChange={e => setEditForm({ ...editForm, category: e.target.value })}><option value="LEADER">宮主 (第一層)</option><option value="EXECUTIVE">幹事/委員 (第二層)</option><option value="STAFF">執事/志工 (第三層)</option></select></div>
                                        </>
                                    ) : activeTab === 'FAQS' ? (
                                        <>
                                            <div className="space-y-1 md:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-widest">問題 (Question)</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.question || ''} onChange={e => setEditForm({ ...editForm, question: e.target.value })} /></div>
                                            <div className="space-y-1 md:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-widest">解答 (Answer)</label><textarea rows={5} className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.answer || ''} onChange={e => setEditForm({ ...editForm, answer: e.target.value })} /></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">標題</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                            <div className="space-y-1"><label className="text-xs text-gray-500 uppercase tracking-widest">類型</label><select className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.type || 'IMAGE'} onChange={e => setEditForm({ ...editForm, type: e.target.value })}><option value="IMAGE">圖片</option><option value="VIDEO">影片</option><option value="YOUTUBE">YouTube</option></select></div>
                                            <div className="space-y-1 md:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-widest">連結 URL</label><input className="w-full bg-black border border-white/10 p-3 text-white focus:border-mystic-gold outline-none" value={editForm.url || ''} onChange={e => setEditForm({ ...editForm, url: e.target.value })} /></div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                                    <button onClick={handleSave} className="bg-mystic-gold text-black px-8 py-3 rounded-sm font-bold hover:bg-white transition-all shadow-lg"><Save size={18} className="inline-block mr-2 mb-1" /> 儲存變更</button>
                                    <button onClick={() => { setEditingId(null); setIsAdding(false); setEditForm({}); }} className="bg-gray-800 text-white px-8 py-3 rounded-sm hover:bg-gray-700 transition-all">取消</button>
                                </div>
                            </div>
                        )}

                        {/* Data Table */}
                        {activeTab === 'REGISTRATIONS' && (
                            <div className="flex flex-col gap-4 mb-4 bg-white/5 p-4 rounded border border-white/10">
                                {/* Top Row: Filters & Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* Event Filter */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-400 uppercase font-bold">篩選：</label>
                                            <select
                                                className="bg-black border border-white/20 text-white text-sm p-2 rounded outline-none focus:border-mystic-gold"
                                                value={selectedEventFilter}
                                                onChange={(e) => setSelectedEventFilter(e.target.value)}
                                            >
                                                <option value="ALL">全部活動</option>
                                                {uniqueEventTitles.map(title => (
                                                    <option key={title} value={title}>{title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Search Box */}
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="搜尋姓名/電話..."
                                                className="bg-black border border-white/20 text-white text-sm p-2 pl-8 rounded outline-none focus:border-mystic-gold w-48"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <Briefcase size={14} className="absolute left-2.5 top-3 text-gray-500" />
                                            {/* Note: Icon usage above is arbitrary, using Search icon if imported would be better but reusing imported Briefcase or similar for generic icon or just wait for Search import fix if needed. Actually Search is imported in line 5. */}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {selectedItems.size > 0 && (
                                            <button
                                                onClick={handleBatchDelete}
                                                className="bg-red-900/80 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-red-800 transition-colors animate-fade-in"
                                            >
                                                <Trash2 size={16} /> 刪除選取 ({selectedItems.size})
                                            </button>
                                        )}
                                        <button
                                            onClick={handleExportCSV}
                                            className="bg-green-800 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-colors"
                                        >
                                            <FileText size={16} /> 匯出名單 (Excel)
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Row: Stats */}
                                <div className="text-xs text-gray-500 flex justify-between items-center bg-black/20 p-2 rounded">
                                    <span>顯示搜尋結果: {filteredRegistrations.length} 筆資料 (共 {registrations.length} 筆)</span>
                                    <span>已選取: {selectedItems.size} 筆</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'REGISTRATIONS' && (
                            <div className="bg-mystic-charcoal rounded overflow-hidden border border-white/5 shadow-2xl flex flex-col min-h-[500px]">
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[10px]">
                                            <tr>
                                                <th className="p-4 w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="cursor-pointer"
                                                        checked={filteredRegistrations.length > 0 && selectedItems.size === filteredRegistrations.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>
                                                <th className="p-4">項目</th>
                                                <th className="p-4">金額</th>
                                                <th className="p-4">匯款後五碼</th>
                                                <th className="p-4">詳情</th>
                                                <th className="p-4 text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {paginatedRegistrations.map(reg => (
                                                <tr key={reg.id} className={`hover:bg-white/5 ${selectedItems.has(reg.id) ? 'bg-white/5' : ''}`}>
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            className="cursor-pointer"
                                                            checked={selectedItems.has(reg.id)}
                                                            onChange={() => handleSelectOne(reg.id)}
                                                        />
                                                    </td>
                                                    <td className="p-4"><div className="font-bold text-white">{reg.name}</div><div className="text-xs text-gray-400">{reg.phone}</div><div className="text-xs text-mystic-gold">{reg.serviceTitle}</div></td>
                                                    <td className="p-4 text-mystic-gold font-bold">NT$ {reg.amount}</td>
                                                    <td className="p-4 text-gray-300 font-mono">{reg.bankLastFive || '-'}</td>
                                                    <td className="p-4"><button onClick={() => handleToggleStatus(reg)} className={`flex items-center gap-2 px-3 py-1 rounded-full border ${reg.isProcessed ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>{reg.isProcessed ? '已圓滿' : '未辦理'}</button></td>
                                                    <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handlePrintReceipt(reg)} className="p-2 bg-gray-700 rounded"><Printer size={16} /></button><button onClick={() => handleEdit(reg)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('REGISTRATION', reg.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center items-center gap-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-30 hover:bg-gray-700"
                                    >
                                        上一頁
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        第 <span className="text-white font-bold">{currentPage}</span> / {totalPages || 1} 頁
                                    </span>
                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-30 hover:bg-gray-700"
                                    >
                                        下一頁
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Shared Table for Non-Registration Tabs */}
                        {activeTab !== 'REGISTRATIONS' && activeTab !== 'GENERAL' && (
                            <div className="bg-mystic-charcoal rounded overflow-hidden border border-white/5 shadow-2xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm min-w-[600px]">
                                        <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[10px]">
                                            <tr>
                                                {activeTab === 'GALLERY' || activeTab === 'ORG' ? <th className="p-4">內容</th> : <th className="p-4">標題/名稱</th>}
                                                <th className="p-4">詳細資訊</th>
                                                <th className="p-4 text-right">操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {activeTab === 'EVENTS' && events.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5">
                                                    <td className="p-4 text-white font-bold">{item.title}</td>
                                                    <td className="p-4 text-gray-400">
                                                        <div className="mb-1">{item.date} ({item.lunarDate})</div>
                                                        <div className="flex gap-1">
                                                            {item.fieldConfig?.showBirth && <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">生辰</span>}
                                                            {item.fieldConfig?.showTime && <span className="text-[10px] bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">時辰</span>}
                                                            {item.fieldConfig?.showAddress && <span className="text-[10px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">地址</span>}
                                                            {item.fieldConfig?.showIdNumber && <span className="text-[10px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">身分證</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('EVENT', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}
                                            {activeTab === 'NEWS' && news.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5"><td className="p-4 text-white font-bold">{item.title}</td><td className="p-4 text-gray-400">{item.date}</td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('NEWS', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td></tr>
                                            ))}
                                            {activeTab === 'SERVICES' && services.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5">
                                                    <td className="p-4 text-white font-bold">{item.title}</td>
                                                    <td className="p-4 text-gray-400">
                                                        <div className="mb-1">${item.price}</div>
                                                        <div className="flex gap-1">
                                                            {item.fieldConfig?.showBirth && <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">生辰</span>}
                                                            {item.fieldConfig?.showTime && <span className="text-[10px] bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">時辰</span>}
                                                            {item.fieldConfig?.showAddress && <span className="text-[10px] bg-blue-900/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">地址</span>}
                                                            {item.fieldConfig?.showIdNumber && <span className="text-[10px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">身分證</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('SERVICE', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}
                                            {activeTab === 'GALLERY' && gallery.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5"><td className="p-4 flex gap-4"><img src={item.url} className="w-10 h-10 object-cover rounded" /><span className="text-white font-bold">{item.title}</span></td><td className="p-4 text-gray-400">{item.type}</td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('GALLERY', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td></tr>
                                            ))}
                                            {activeTab === 'ORG' && orgMembers.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5"><td className="p-4 flex gap-4"><img src={item.image} className="w-10 h-10 object-cover rounded-full" /><div><div className="font-bold text-white">{item.name}</div><div className="text-xs text-gray-400">{item.title}</div></div></td><td className="p-4 text-gray-400"><span className={`px-2 py-1 rounded text-xs border ${item.category === 'LEADER' ? 'border-mystic-gold text-mystic-gold' : item.category === 'EXECUTIVE' ? 'border-blue-500 text-blue-400' : 'border-gray-500 text-gray-400'}`}>{item.category === 'LEADER' ? '宮主' : item.category === 'EXECUTIVE' ? '幹事/委員' : '執事/志工'}</span></td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('ORG', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td></tr>
                                            ))}
                                            {activeTab === 'FAQS' && faqs.map(item => (
                                                <tr key={item.id} className="hover:bg-white/5"><td className="p-4 text-white font-bold">{item.question}</td><td className="p-4 text-gray-400 line-clamp-1">{item.answer.substring(0, 50)}...</td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEdit(item)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit size={16} /></button><button onClick={() => handleDelete('FAQ', item.id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button></td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {((activeTab === 'EVENTS' && events.length === 0) || (activeTab === 'GALLERY' && gallery.length === 0) || (activeTab === 'NEWS' && news.length === 0) || (activeTab === 'ORG' && orgMembers.length === 0) || (activeTab === 'FAQS' && faqs.length === 0)) && <div className="p-12 text-center text-gray-600">目前暫無資料</div>}
                            </div>
                        )}
                    </>
                )}
            </div >
        </div >
    );
};

export default AdminPanel;
