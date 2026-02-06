import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, Package, Calendar, MapPin, LogOut, ChevronRight, Printer, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import AuthModal from './AuthModal';
import ServiceModal from './ServiceModal';
import { MemberLibrary } from './MemberLibrary';
import { ServiceItem } from '../types';

interface MemberCenterProps {
    onBack: () => void;
}

const MemberCenter: React.FC<MemberCenterProps> = ({ onBack }) => {
    const { user, userProfile, signOut, registrations, siteSettings, addRegistration } = useData();
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS' | 'SCRIPTURES' | 'FORTUNE'>('PROFILE');
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

    // --- Zodiac & Tai Sui Logic ---
    const getZodiac = (year: number) => {
        const zodiacs = ['猴', '雞', '狗', '豬', '鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊'];
        return zodiacs[year % 12];
    };

    const getTaiSuiStatus = (birthYear: number, targetYear: number) => {
        const zodiacIndex = birthYear % 12; // 0=Monkey, ... 4=Rat, 5=Ox, 7=Rabbit, 10=Horse, 1=Rooster
        const targetIndex = targetYear % 12; // 2026 % 12 = 10 (Horse)
        
        // Specific Logic for 2026 (Horse Year)
        if (targetIndex === 10) {
            // Horse (10) - Value + Punishment
            if (zodiacIndex === 10) return { status: '值太歲 / 刑太歲', description: '本命年且自刑，運勢起伏大，宜靜不宜動，注意情緒與健康。', severity: 'high' };
            // Rat (4) - Clash
            if (zodiacIndex === 4) return { status: '沖太歲', description: '沖者動也，正沖流年，易有變動、奔波勞碌，慎防大耗。', severity: 'high' };
            // Ox (5) - Harm
            if (zodiacIndex === 5) return { status: '害太歲', description: '害者陷害，易犯小人、被陷害或有溝通誤解。', severity: 'medium' };
            // Rabbit (7) - Destruction (Po)
            if (zodiacIndex === 7) return { status: '破太歲', description: '馬兔相破，易有突如其來的破壞、人際失和或小病痛。', severity: 'low' };
            // Rooster (1) - Destruction (Po) - According to HelloYishi source
            if (zodiacIndex === 1) return { status: '破太歲', description: '運勢小破，需注意與人合作細節，避免財物損失。', severity: 'low' };
        } else {
             // Fallback for other years (Generic logic)
            const diff = (targetIndex - zodiacIndex + 12) % 12;
            if (diff === 0) return { status: '值太歲', description: '本命年，運勢起伏較大，宜靜不宜動。', severity: 'high' };
            if (diff === 6) return { status: '沖太歲', description: '沖者動也，易有變動、奔波勞碌。', severity: 'high' };
            if (diff === 3) return { status: '刑太歲', description: '刑者傷也，易有是非口舌、官非。', severity: 'medium' };
            if (diff === 9) return { status: '害太歲', description: '害者陷害，易犯小人、被陷害。', severity: 'medium' };
            if (diff === 2 || diff === 11) return { status: '破太歲', description: '破者破耗，易有錢財破損。', severity: 'low' };
        }
        return null;
    };
    
    const currentYear = new Date().getFullYear();
    // Use user birth year or default to current year for demo consistency if missing
    // Parsing "1987" from string "1987"
    const birthYear = userProfile?.birthYear ? parseInt(userProfile.birthYear) : null;
    const myZodiac = birthYear ? getZodiac(birthYear) : '未知';
    const taiSuiInfo = birthYear ? getTaiSuiStatus(birthYear, currentYear) : null;
    // --------------------------------

    // Filter registrations for current user
    // Note: In a real app with RLS, the main registrations array might only contain user's data
    // Or we need a specific fetch for user orders. 
    // For now, assuming we filter by matching phone number or created user_id logic if available locally
    // Since we just added user_id column, existing records won't have it.
    // robust logic: Filter by phone match as fallback or user_id if we had it in frontend type.
    const myOrders = registrations.filter(r =>
        (userProfile?.phone && r.phone === userProfile.phone) ||
        (r as any).userId === user?.id // Future proofing if we add userId to Registration type
    );

    const handlePrintReceipt = (order: any) => {
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (!printWindow) return;

        const today = new Date();
        const dateStr = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
        const timeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

        const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>收據預覽 - ${order.name}</title>
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
                <div class="info-row"><span>單號：${order.id.substring(order.id.length - 6)}</span><span>機台：WEB-MBR</span></div>
                <div class="info-row"><span>日期：${dateStr}</span><span>時間：${timeStr}</span></div>
                <div class="info-row"><span>信眾：${order.name}</span><span>電話：${order.phone}</span></div>
                <div class="divider"></div>
                <div class="table-header"><span>項目名稱</span><span>金額</span></div>
                <div class="item-row"><span>${order.serviceTitle}</span><span>NT$ ${order.amount}</span></div>
                <div class="divider"></div>
                <div class="total-section">總計 NT$ ${order.amount}</div>
                <div class="info-row" style="margin-top: 10px;"><span>支付方式：</span><span>現金/轉帳</span></div>
                <div class="footer"><div class="note">此為宮廟內部收據<br/>僅供證明，不得作為兌獎或報稅憑證</div><p>感謝您的護持，功德無量。</p><p>經手人：(線上列印)</p></div>
            </div>
            <div class="actions-bar no-print"><button class="btn btn-print" onclick="window.print()">🖨️ 確認列印</button><button class="btn btn-close" onclick="window.close()">關閉視窗</button></div>
        </body>
        </html>
        `;

        printWindow.document.write(fullHtml);
        printWindow.document.close();
    };

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 container mx-auto text-center">
                <h2 className="text-2xl font-bold text-white mb-4">請先登入</h2>
                <button onClick={onBack} className="text-mystic-gold hover:underline">返回首頁</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-mystic-dark">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header / Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-400">
                    <button onClick={onBack} className="hover:text-white transition-colors">首頁</button>
                    <ChevronRight size={14} />
                    <span className="text-mystic-gold">會員中心</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-zinc-900 border border-white/5 rounded-lg p-6 text-center">
                            <div className="w-20 h-20 bg-mystic-gold/20 rounded-full flex items-center justify-center text-mystic-gold text-3xl font-bold mx-auto mb-4">
                                {userProfile?.fullName?.[0] || <User />}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{userProfile?.fullName || '會員'}</h2>
                            <p className="text-xs text-gray-500 mb-4">{user.email}</p>

                            <button
                                onClick={signOut}
                                className="w-full border border-red-900/50 text-red-400 hover:bg-red-900/20 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors"
                            >
                                <LogOut size={16} /> 登出帳號
                            </button>
                        </div>

                        <div className="bg-zinc-900 border border-white/5 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setActiveTab('PROFILE')}
                                className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${activeTab === 'PROFILE' ? 'bg-mystic-gold/10 text-mystic-gold border-l-2 border-mystic-gold' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <User size={18} />
                                個人資料
                            </button>
                            <button
                                onClick={() => setActiveTab('ORDERS')}
                                className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${activeTab === 'ORDERS' ? 'bg-mystic-gold/10 text-mystic-gold border-l-2 border-mystic-gold' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Package size={18} />
                                祈福紀錄
                            </button>
                            <button
                                onClick={() => setActiveTab('SCRIPTURES')}
                                className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${activeTab === 'SCRIPTURES' ? 'bg-mystic-gold/10 text-mystic-gold border-l-2 border-mystic-gold' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <BookOpen size={18} />
                                我的經文庫
                            </button>
                            <button
                                onClick={() => setActiveTab('FORTUNE')}
                                className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${activeTab === 'FORTUNE' ? 'bg-mystic-gold/10 text-mystic-gold border-l-2 border-mystic-gold' : 'text-gray-400 hover:bg-white/5'}`}
                            >
                                <Sparkles size={18} />
                                線上安太歲/算命
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {activeTab === 'PROFILE' && (
                            <div className="bg-zinc-900 border border-white/5 rounded-lg p-6 md:p-8 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <User className="text-mystic-gold" size={20} />
                                        基本資料
                                    </h3>
                                    <button
                                        onClick={() => setIsEditProfileOpen(true)}
                                        className="text-xs border border-mystic-gold text-mystic-gold px-3 py-1.5 rounded hover:bg-mystic-gold hover:text-black transition-colors"
                                    >
                                        編輯資料
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">姓名</label>
                                        <div className="text-lg text-gray-200">{userProfile?.fullName || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">聯絡電話</label>
                                        <div className="text-lg text-gray-200">{userProfile?.phone || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">農曆生日</label>
                                        <div className="text-lg text-gray-200 flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-600" />
                                            {userProfile?.birthYear ? `${userProfile.birthYear}年 ${userProfile.birthMonth}月 ${userProfile.birthDay}日 ${userProfile.birthHour}時` : '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs text-gray-500">居住地址</label>
                                        <div className="text-lg text-gray-200 flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-600" />
                                            {userProfile?.city ? `${userProfile.city}${userProfile.district}${userProfile.address}` : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ORDERS' && (
                            <div className="bg-zinc-900 border border-white/5 rounded-lg p-6 md:p-8 animate-fade-in-up">
                                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-2">
                                    <Package className="text-mystic-gold" size={20} />
                                    歷史祈福紀錄
                                </h3>

                                {myOrders.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>目前尚無祈福紀錄</p>
                                        <button onClick={onBack} className="mt-4 text-mystic-gold hover:underline text-sm">
                                            前往報名服務
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myOrders.map((order) => (
                                            <div key={order.id} className="bg-black/30 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-mystic-gold font-bold text-lg">{order.serviceTitle}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${order.status === 'PAID'
                                                            ? (order.isProcessed ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-blue-500/30 text-blue-400 bg-blue-500/10') :
                                                            order.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                                'border-red-500/30 text-red-400 bg-red-500/10'
                                                            }`}>
                                                            {order.status === 'PAID'
                                                                ? (order.isProcessed ? '已圓滿' : '已付款/辦理中')
                                                                : order.status === 'PENDING' ? '待付款/處理中' : '已取消'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        祈福對象：{order.name}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-serif text-white mb-2">NT$ {order.amount}</div>
                                                    {order.isProcessed && (
                                                        <button
                                                            onClick={() => handlePrintReceipt(order)}
                                                            className="text-xs flex items-center gap-1 bg-mystic-gold/20 text-mystic-gold px-3 py-1.5 rounded hover:bg-mystic-gold hover:text-black transition-colors ml-auto"
                                                        >
                                                            <Printer size={14} />
                                                            列印收據
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'SCRIPTURES' && user && (
                            <div className="animate-fade-in-up">
                                <MemberLibrary userId={user.id} />
                            </div>
                        )}

                        {activeTab === 'FORTUNE' && (
                            <div className="bg-zinc-900 border border-white/5 rounded-lg p-6 md:p-8 animate-fade-in-up">
                                <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-2">
                                    <Sparkles className="text-mystic-gold" size={20} />
                                    我的流年運勢 ({currentYear}年)
                                </h3>

                                {!birthYear ? (
                                    <div className="text-center py-10">
                                        <div className="text-gray-400 mb-4">請先完善個人生日資料，以獲取準確運勢分析。</div>
                                        <button 
                                            onClick={() => setIsEditProfileOpen(true)}
                                            className="bg-mystic-gold text-black px-6 py-2 rounded font-bold hover:bg-yellow-500 transition-colors"
                                        >
                                            填寫生日資料
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left: Status Card */}
                                        <div className="space-y-6">
                                            <div className="bg-black/40 border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-mystic-gold/30 transition-colors">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-8xl font-bold text-white select-none">
                                                    {myZodiac}
                                                </div>
                                                
                                                <div className="relative z-10">
                                                    <div className="text-gray-400 text-sm mb-1">您的生肖</div>
                                                    <div className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                                                        {myZodiac}
                                                        <span className="text-sm bg-white/10 px-2 py-1 rounded text-gray-300 font-normal">
                                                            {birthYear}年生
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-px bg-white/10 my-4"></div>

                                                    <div className="text-gray-400 text-sm mb-1">流年運勢狀態</div>
                                                    {taiSuiInfo ? (
                                                        <div>
                                                            <div className={`text-3xl font-bold mb-2 ${taiSuiInfo.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                                {taiSuiInfo.status}
                                                            </div>
                                                            <p className="text-gray-300">
                                                                {taiSuiInfo.description}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-3xl font-bold text-green-400 mb-2">運勢平穩</div>
                                                            <p className="text-gray-300">
                                                                今年無沖犯太歲，運勢相對平穩，可多行善積德，增長福氣。
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Section */}
                                            {taiSuiInfo && (
                                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-red-500/20 p-2 rounded-full text-red-400">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-red-200">建議安太歲祈福</div>
                                                            <div className="text-xs text-red-300/70">化解流年煞氣，保佑平安順遂</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            if (!userProfile?.fullName || !userProfile?.phone) {
                                                                alert('請先完善個人資料（姓名、電話）才能報名。');
                                                                setIsEditProfileOpen(true);
                                                                return;
                                                            }
                                                            
                                                            // Setup Service Item for Tai Sui
                                                            const taiSuiService: ServiceItem = {
                                                                id: 'taisui_2026_member',
                                                                title: '線上安太歲',
                                                                price: 600,
                                                                type: 'RITUAL', 
                                                                description: '祈求流年平安，消災解厄',
                                                                iconName: 'Sparkles',
                                                                // Config matching LIGHT/RITUAL needs
                                                                fieldConfig: { showBirth: true, showTime: true, showAddress: true, showIdNumber: false }
                                                            };
                                                            setSelectedService(taiSuiService);
                                                            setIsServiceModalOpen(true);
                                                        }}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95 whitespace-nowrap"
                                                    >
                                                        立即報名 ($600)
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Info / Services */}
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-mystic-gold border-l-4 border-mystic-gold pl-3">
                                                本宮相關服務
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="bg-zinc-800 p-4 rounded hover:bg-zinc-700 transition-colors cursor-pointer border border-transparent hover:border-white/10 flex justify-between items-center group">
                                                    <div>
                                                        <div className="font-bold text-white mb-1 group-hover:text-mystic-gold transition-colors">安太歲燈</div>
                                                        <div className="text-xs text-gray-500">適合犯太歲者，祈求流年平安</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                                                </div>
                                                <div className="bg-zinc-800 p-4 rounded hover:bg-zinc-700 transition-colors cursor-pointer border border-transparent hover:border-white/10 flex justify-between items-center group">
                                                    <div>
                                                        <div className="font-bold text-white mb-1 group-hover:text-mystic-gold transition-colors">光明燈 / 平安燈</div>
                                                        <div className="text-xs text-gray-500">照亮前程，增長智慧與福報</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                                                </div>
                                                <div className="bg-zinc-800 p-4 rounded hover:bg-zinc-700 transition-colors cursor-pointer border border-transparent hover:border-white/10 flex justify-between items-center group">
                                                    <div>
                                                        <div className="font-bold text-white mb-1 group-hover:text-mystic-gold transition-colors">制解 / 祭改</div>
                                                        <div className="text-xs text-gray-500">消災解厄，去除霉運</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                                <p className="text-sm text-gray-400 mb-4">
                                                    若您有其他命理諮詢需求，歡迎親臨本宮或預約老師諮詢。
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Re-use AuthModal for editing profile */}
            <AuthModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            
            {/* Service Registration Modal */}
             <ServiceModal 
                isOpen={isServiceModalOpen} 
                onClose={() => setIsServiceModalOpen(false)} 
                service={selectedService}
                initialEventTitle="線上安太歲"
            />
        </div>
    );
};

export default MemberCenter;
