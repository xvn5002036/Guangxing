import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Announcement {
    id: string;
    content: string;
    is_active: boolean;
    priority: number;
}

const MarqueeAnnouncement: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error('獲取跑馬燈公告失敗:', error);
                return;
            }

            setAnnouncements(data || []);
            setIsVisible(data && data.length > 0);
        };

        fetchAnnouncements();

        // 訂閱 Supabase Realtime 更新
        const channel = supabase
            .channel('public:announcements')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'announcements' },
                (payload) => {
                    console.log('收到即時公告更新:', payload);
                    // 當有變動時重新抓取公告資料
                    fetchAnnouncements();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!isVisible || announcements.length === 0) return null;

    // 串接所有的啟用中公告，以特定符號區分
    const combinedText = announcements.map(a => a.content).join(' ✦ ');

    return (
        <div className="fixed bottom-0 left-0 w-full bg-mystic-charcoal border-t border-mystic-gold/30 text-mystic-paper py-2 overflow-hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            <div className="container mx-auto px-4 flex items-center">
                <div className="flex-shrink-0 text-mystic-gold mr-4 flex items-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <span className="font-bold text-sm tracking-widest whitespace-nowrap">最新消息</span>
                </div>
                <div className="overflow-hidden flex-grow group min-w-0">
                    <div className="whitespace-nowrap inline-block animate-marquee group-hover:[animation-play-state:paused] cursor-default text-sm md:text-base pl-[100%]">
                        <span className="pr-10">{combinedText}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarqueeAnnouncement;
