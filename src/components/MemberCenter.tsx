import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { User, Package, Calendar, MapPin, LogOut, ChevronRight } from 'lucide-react';
import AuthModal from './AuthModal';

interface MemberCenterProps {
    onBack: () => void;
}

const MemberCenter: React.FC<MemberCenterProps> = ({ onBack }) => {
    const { user, userProfile, signOut, registrations, siteSettings } = useData();
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS'>('PROFILE');
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

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
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${order.status === 'PAID' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                                                order.status === 'PENDING' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                                                    'border-red-500/30 text-red-400 bg-red-500/10'
                                                            }`}>
                                                            {order.status === 'PAID' ? '已付款/已受理' : order.status === 'PENDING' ? '待付款/處理中' : '已取消'}
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
                                                    <div className="text-xl font-serif text-white">NT$ {order.amount}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Re-use AuthModal for editing profile */}
            <AuthModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
        </div>
    );
};

export default MemberCenter;
