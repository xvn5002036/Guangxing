import React, { useState, useEffect } from 'react';
import { Book, Download, Eye, Loader2, FileText, FileSpreadsheet, FilePieChart, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabase';

interface PurchasedItem {
    id: string;
    created_at: string;
    digital_products: {
        id: string;
        title: string;
        description: string;
        file_type: string;
        preview_url: string;
    }
}

export const MemberLibrary: React.FC<{ userId: string }> = ({ userId }) => {
    const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingUrl, setReadingUrl] = useState<string | null>(null);
    const [readingTitle, setReadingTitle] = useState('');

    useEffect(() => {
        fetchLibrary();
    }, [userId]);

    const fetchLibrary = async () => {
        try {
            // 注意：實際環境中建議呼叫後端 API 以確保安全性
            // 這裡先演示前端串接邏輯
            const response = await fetch(`/api/my-library?userId=${userId}`);
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching library:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (productId: string, title: string, type: string) => {
        try {
            // 向後端請求簽署連結
            const response = await fetch(`/api/download/${productId}?userId=${userId}`);
            const data = await response.json();
            
            if (data.url) {
                if (type.toLowerCase() === 'pdf') {
                    setReadingUrl(data.url);
                    setReadingTitle(title);
                } else {
                    // 非 PDF 檔案 (Word/Excel/PPT) 則直接下載
                    window.open(data.url, '_blank');
                }
            }
        } catch (error) {
            alert('無法獲取檔案連結，請稍後再試。');
        }
    };

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'pdf') return <FileText className="text-red-400" />;
        if (t === 'xlsx' || t === 'xls') return <FileSpreadsheet className="text-green-400" />;
        if (t === 'pptx' || t === 'ppt') return <FilePieChart className="text-orange-400" />;
        return <Book className="text-blue-400" />;
    };

    if (loading) return (
        <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-mystic-gold" size={40} />
        </div>
    );

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 border-b border-mystic-gold/30 pb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-widest text-white uppercase mb-2">個人數位藏書</h1>
                        <p className="text-gray-400">已購買並開通閱讀權限之數位道藏</p>
                    </div>
                </header>

                {purchases.length === 0 ? (
                    <div className="text-center py-20 bg-mystic-charcoal rounded-sm border border-dashed border-white/10">
                        <Book size={64} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">您尚未購買任何經文</p>
                        <button className="mt-4 text-mystic-gold border border-mystic-gold px-6 py-2 hover:bg-mystic-gold hover:text-black transition-all">
                            前往請購
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {purchases.map((item) => (
                            <div key={item.id} className="bg-mystic-charcoal border border-white/10 p-6 rounded-sm group hover:border-mystic-gold/50 transition-all shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-black rounded-lg group-hover:scale-110 transition-transform">
                                        {getIcon(item.digital_products.file_type)}
                                    </div>
                                    <span className="text-[10px] bg-white/5 px-2 py-1 text-gray-500 uppercase font-mono">
                                        ID: {item.digital_products.id.substring(0, 8)}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-mystic-gold transition-colors">
                                    {item.digital_products.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                                    {item.digital_products.description}
                                </p>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleRead(item.digital_products.id, item.digital_products.title, item.digital_products.file_type)}
                                        className="flex-1 bg-mystic-gold text-black font-bold py-2 rounded-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
                                    >
                                        {item.digital_products.file_type.toLowerCase() === 'pdf' ? <Eye size={18} /> : <Download size={18} />}
                                        {item.digital_products.file_type.toLowerCase() === 'pdf' ? '線上閱讀' : '下載檔案'}
                                    </button>
                                </div>
                                <div className="mt-4 text-[10px] text-gray-600 flex justify-between">
                                    <span>請購日期: {new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="text-green-500 font-bold uppercase">已開通</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PDF Viewer Modal */}
                {readingUrl && (
                    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col p-4">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h2 className="text-xl font-bold text-mystic-gold">{readingTitle} - 在線閱讀</h2>
                            <button 
                                onClick={() => setReadingUrl(null)}
                                className="bg-white/10 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Eye className="rotate-45" size={24} /> 關閉閱讀
                            </button>
                        </div>
                        <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-2xl">
                            <iframe 
                                src={`${readingUrl}#toolbar=0`} 
                                className="w-full h-full border-none"
                                title="Scripture Viewer"
                            />
                        </div>
                        <div className="py-4 text-center text-xs text-gray-500">
                            廣行宮數位經文庫 - 僅供個人修持閱讀，請勿私自轉發或用於任何商業用途
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
