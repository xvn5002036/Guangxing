import React, { useState, useEffect } from 'react';
import { ShoppingCart, BookOpen, CheckCircle2, Loader2, Info } from 'lucide-react';
import { supabase } from '../services/supabase';

import { useData } from '../context/DataContext';
import { DigitalProduct } from '../types';

export const ScriptureShop: React.FC<{ userId?: string }> = ({ userId }) => {
    const { scriptures: products } = useData();
    const [myPurchasedIds, setMyPurchasedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('ALL');

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!userId) {
                setMyPurchasedIds(new Set());
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('purchases')
                    .select('product_id')
                    .eq('user_id', userId);
                
                if (data) {
                    const purchasedSet = new Set(data.map((item: any) => item.product_id));
                    setMyPurchasedIds(purchasedSet);
                }
            } catch (error) {
                console.error('Fetch Library Error:', error);
            }
        };

        fetchLibrary();
    }, [userId]);



    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);

    // Bank Details - You can move this to config or database later
    const BANK_INFO = {
        bankName: '000 測試銀行',
        branch: '測試分行',
        accountNumber: '1234-5678-9012',
        accountName: '新莊武壇廣行宮'
    };

    if (loading) return (
        <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-mystic-gold" size={40} />
        </div>
    );

    const handleBuy = (product: DigitalProduct) => {
        if (!userId) {
            alert('請先登入會員再進行請購');
            return;
        }
        setSelectedProduct(product);
        setShowBankModal(true);
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white relative">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-[0.3em] text-mystic-gold uppercase mb-4">道藏經圖書館</h1>
                    <div className="w-24 h-1 bg-mystic-gold mx-auto mb-6"></div>
                    <p className="text-gray-400 max-w-2xl mx-auto italic">
                        「道可道，非常道。」—— 歡迎進入廣行宮道藏圖書館。此處收錄歷代珍貴道藏經典與數位電子書，僅限會員收藏與恭敬研讀。
                    </p>
                </header>

                {/* Category Filters */}
                <div className="flex justify-center gap-4 mb-12">
                    {['ALL', '數位道藏', '精選電子書', '法會手冊'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all border ${
                                activeCategory === cat 
                                ? 'bg-mystic-gold text-black border-mystic-gold' 
                                : 'text-gray-400 border-white/10 hover:border-mystic-gold/50'
                            }`}
                        >
                            {cat === 'ALL' ? '全館藏書' : cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.filter(p => activeCategory === 'ALL' || p.category === activeCategory).map((product) => {
                        const isPurchased = myPurchasedIds.has(product.id);
                        
                        return (
                            <div key={product.id} className="relative group bg-mystic-charcoal/50 border border-white/5 overflow-hidden rounded-sm hover:border-mystic-gold/40 transition-all duration-500">
                                {/* Preview Image / Icon Placeholder */}
                                <div className="aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
                                    {product.previewUrl ? (
                                        <img src={product.previewUrl} alt={product.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-mystic-gold/20">
                                            <BookOpen size={64} strokeWidth={1} />
                                            <span className="mt-4 text-[10px] tracking-[0.3em] uppercase">Digital Collection</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-mystic-charcoal to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-black/80 border border-mystic-gold/30 px-3 py-1 text-[10px] text-mystic-gold font-bold tracking-widest uppercase">
                                        {product.fileType}
                                    </div>
                                </div>

                                <div className="p-6 relative">
                                    <div className="mb-1 text-xs text-mystic-gold font-bold uppercase tracking-widest opacity-70">
                                        {product.category || '道藏經典'}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-mystic-gold transition-colors">{product.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                        {product.description || '本道藏經文已進行數位化修復，適配手機、平板與電腦閱讀。收藏後可永久於個人圖庫中研讀。'}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="text-2xl font-bold text-mystic-gold">
                                            <span className="text-sm font-normal mr-1">NT$</span>
                                            {product.price.toLocaleString()}
                                        </div>
                                        
                                        {isPurchased ? (
                                            <button 
                                                disabled
                                                className="bg-green-900/20 text-green-400 border border-green-900/50 px-6 py-2 rounded-sm flex items-center gap-2 font-bold"
                                            >
                                                <CheckCircle2 size={18} /> 已開通
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleBuy(product)}
                                                className="bg-mystic-gold text-black px-6 py-2 rounded-sm flex items-center gap-2 font-bold hover:bg-white transition-all active:scale-95"
                                            >
                                                <ShoppingCart size={18} />
                                                請購收藏
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isPurchased && (
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 p-8 bg-mystic-charcoal/30 border border-white/5 rounded-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-mystic-gold/10 p-3 rounded-full">
                            <Info className="text-mystic-gold" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">圖書館收藏與閱讀須知</h4>
                            <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4">
                                <li>所有道藏商品均為數位電子版本 (PDF/EPUB)，一經收藏開通權限，恕不接受退款。</li>
                                <li>收藏之經典將永久保存於您的「會員中心 - 個人道藏圖庫」中。</li>
                                <li>為尊重版權與信仰，內容僅供個人修持觀閱，請勿將檔案私自散布、轉發或用於商業用途。</li>
                                <li>系統設有防重複機制，每位會員僅需收藏一次即可永久擁有閱讀權限。</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bank Transfer Modal */}
            {showBankModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-mystic-charcoal border border-mystic-gold/30 rounded-lg p-8 max-w-md w-full shadow-2xl relative">
                        <button 
                            onClick={() => setShowBankModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-2xl font-bold text-mystic-gold mb-6 text-center border-b border-white/10 pb-4">
                            匯款資訊
                        </h3>

                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-2">您即將請購</p>
                                <p className="text-xl font-bold text-white mb-1">{selectedProduct.title}</p>
                                <p className="text-2xl text-mystic-gold font-bold">NT$ {selectedProduct.price.toLocaleString()}</p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-md border border-white/5 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">銀行代碼</span>
                                    <span className="text-white font-mono">{BANK_INFO.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">銀行帳號</span>
                                    <span className="text-white font-mono tracking-wider">{BANK_INFO.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">戶名</span>
                                    <span className="text-white">{BANK_INFO.accountName}</span>
                                </div>
                            </div>

                            <div className="bg-mystic-gold/10 p-4 rounded text-sm text-mystic-gold/80 border border-mystic-gold/20">
                                <p className="font-bold mb-1">匯款後下一步：</p>
                                <p>請將「匯款明細」截圖或告知「帳號末五碼」，傳送至官方 LINE 或聯絡管理員，我們將為您開通權限。</p>
                            </div>

                            <button
                                onClick={() => setShowBankModal(false)}
                                className="w-full bg-mystic-gold text-black font-bold py-3 rounded hover:bg-white transition-colors"
                            >
                                我已了解，稍後匯款
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
