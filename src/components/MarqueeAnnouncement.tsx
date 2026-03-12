import { useData } from '../context/DataContext';

const MarqueeAnnouncement: React.FC = () => {
    const { announcements: allAnnouncements } = useData();

    // 過濾出啟用中的公告，並依照優先度排序
    const activeAnnouncements = allAnnouncements
        .filter(a => (a as any).is_active !== false && (a as any).isActive !== false)
        .sort((a, b) => {
            // 優先度排序 (數字大在前)
            if (b.priority !== a.priority) return (b.priority || 0) - (a.priority || 0);
            // 時間排序 (新在前) - 同時支援 created_at 與 createdAt
            const timeB = new Date((b as any).created_at || (b as any).createdAt || 0).getTime();
            const timeA = new Date((a as any).created_at || (a as any).createdAt || 0).getTime();
            return timeB - timeA;
        });

    const isVisible = activeAnnouncements.length > 0;

    if (!isVisible) return null;

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
                    <div className="whitespace-nowrap inline-block animate-marquee group-hover:[animation-play-state:paused] text-sm md:text-base pl-[100%]">
                        <span className="pr-10 flex items-center gap-4">
                            {activeAnnouncements.map((a, index) => (
                                <span key={a.id} className="flex items-center gap-4">
                                    {a.link ? (
                                        <a href={a.link} target="_blank" rel="noopener noreferrer" className="hover:text-mystic-gold hover:underline transition-colors decoration-mystic-gold/50 cursor-pointer">
                                            {a.content}
                                        </a>
                                    ) : (
                                        <span className="cursor-default">{a.content}</span>
                                    )}
                                    {index < activeAnnouncements.length - 1 && <span className="text-mystic-gold/50 text-xs cursor-default">✦</span>}
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarqueeAnnouncement;
