import React, { useState } from 'react';
import { TalismanConfig, TalismanType } from '../types';
import { useData } from '../context/DataContext';
import { Download, Sparkles, Stamp } from 'lucide-react';

const talismanTypes: TalismanConfig[] = [
    { type: 'SAFETY', label: '出入平安', name: '平安符', script: '敕令 平安' },
    { type: 'WEALTH', label: '財源廣進', name: '招財符', script: '敕令 招財' },
    { type: 'LOVE', label: '良緣天成', name: '姻緣符', script: '敕令 姻緣' },
    { type: 'HEALTH', label: '身體健康', name: '護身符', script: '敕令 卻病' },
];

const Talisman: React.FC = () => {
    const { siteSettings } = useData();
    const [selectedType, setSelectedType] = useState<TalismanConfig>(talismanTypes[0]);
    const [userName, setUserName] = useState('');
    const [isGenerated, setIsGenerated] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleGenerate = () => {
        if (!userName.trim()) return;
        setIsAnimating(true);
        setTimeout(() => {
            setIsGenerated(true);
            setIsAnimating(false);
        }, 2000);
    };

    const handleReset = () => {
        setIsGenerated(false);
        setUserName('');
    };

    return (
        <section id="talisman" className="py-24 bg-mystic-charcoal relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    {/* Left: Controls */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Digital Amulet</span>
                            <h2 className="text-4xl font-bold text-white mb-6">祈求靈符</h2>
                            <p className="text-gray-400 font-light leading-relaxed">
                                誠心祈求，王爺敕印。將這份虛擬的祝福保存在身邊，心安則平安。
                            </p>
                        </div>

                        {!isGenerated ? (
                            <div className="bg-black/40 p-8 border border-white/5 rounded-sm space-y-6">
                                <div>
                                    <label className="block text-gray-500 text-sm mb-3">選擇符令種類</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {talismanTypes.map((t) => (
                                            <button
                                                key={t.type}
                                                onClick={() => setSelectedType(t)}
                                                className={`p-4 border text-center transition-all ${selectedType.type === t.type
                                                    ? 'border-mystic-gold bg-mystic-gold/10 text-mystic-gold'
                                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="font-bold">{t.name}</div>
                                                <div className="text-xs mt-1 opacity-70">{t.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-sm mb-3">祈福者姓名</label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="請輸入姓名"
                                        className="w-full bg-black border border-white/10 p-4 text-white focus:border-mystic-gold outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={!userName.trim() || isAnimating}
                                    className="w-full bg-mystic-red hover:bg-red-900 text-white py-4 font-bold tracking-widest transition-all shadow-[0_0_20px_rgba(139,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isAnimating ? (
                                        <>
                                            <Sparkles className="animate-spin w-5 h-5" />
                                            敕印加持中...
                                        </>
                                    ) : (
                                        <>
                                            <Stamp className="w-5 h-5" />
                                            過爐敕印
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center md:text-left space-y-6 animate-fade-in-up">
                                <div className="bg-green-900/20 border border-green-500/30 p-4 text-green-400 mb-6">
                                    <h3 className="font-bold flex items-center justify-center md:justify-start gap-2">
                                        <Sparkles size={18} />
                                        祈求圓滿
                                    </h3>
                                    <p className="text-sm mt-1 opacity-80">王爺已賜福，請截圖或保存符令。</p>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="text-gray-500 underline hover:text-white"
                                >
                                    重新祈求
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: The Talisman Visual */}
                    <div className="w-full md:w-1/2 flex justify-center perspective-1000">
                        <div className={`relative w-[320px] h-[540px] shadow-[0_10px_60px_rgba(255,190,0,0.2)] transition-all duration-1000 transform ${isAnimating ? 'rotate-y-180 scale-95 blur-sm' : 'rotate-y-0 scale-100'} preserve-3d`}>

                            {/* Paper Texture & Background - Yellow Talisman Paper */}
                            <div className="absolute inset-0 bg-[#f7d988] rounded-md overflow-hidden">
                                {/* Subtle Grain Texture */}
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply"></div>
                                {/* Aged Edges Vignette */}
                                <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(139,69,19,0.2)] pointer-events-none"></div>
                            </div>

                            {/* Complex Traditional Border System */}
                            <div className="absolute inset-3 border-[3px] border-red-900/80 rounded-sm pointer-events-none"></div>
                            <div className="absolute inset-2 border border-red-900/40 rounded-sm pointer-events-none"></div>

                            {/* Corner Ornaments */}
                            <div className="absolute top-3 left-3 w-8 h-8 border-t-[4px] border-l-[4px] border-red-900 rounded-tl-lg"></div>
                            <div className="absolute top-3 right-3 w-8 h-8 border-t-[4px] border-r-[4px] border-red-900 rounded-tr-lg"></div>
                            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-[4px] border-l-[4px] border-red-900 rounded-bl-lg"></div>
                            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-[4px] border-r-[4px] border-red-900 rounded-br-lg"></div>

                            {/* Inner Content Container */}
                            <div className="absolute inset-0 py-8 px-6 flex flex-col items-center justify-between text-red-900 z-10 w-full h-full">

                                {/* Header: Temple Seal */}
                                <div className="flex flex-col items-center shrink-0 w-full space-y-1">
                                    <div className="flex items-center gap-2 opacity-60">
                                        <div className="w-1 h-3 bg-red-900/30"></div>
                                        <div className="text-[9px] font-bold tracking-[0.3em] text-red-950 uppercase">Taoist Amulet</div>
                                        <div className="w-1 h-3 bg-red-900/30"></div>
                                    </div>

                                    <div className="relative pt-1 text-center w-full px-2">
                                        {/* Auto-resize text to prevent wrapping. If very long, use smaller font. */}
                                        <h2
                                            className="font-calligraphy font-bold text-red-950 tracking-widest relative z-10 leading-normal break-words w-full"
                                            style={{ fontSize: siteSettings.templeName.length > 8 ? '1.5rem' : '2rem' }}
                                        >
                                            {siteSettings.templeName}
                                        </h2>
                                    </div>

                                    <div className="w-10 h-10 mt-1 border-2 border-red-900 rounded-full flex items-center justify-center bg-red-900/5 relative">
                                        <div className="absolute inset-0 border border-red-900 scale-90 rounded-full opacity-50"></div>
                                        <span className="font-serif font-bold text-xs text-red-900 writing-vertical-rl">靈符</span>
                                    </div>
                                </div>

                                {/* Main Script area - Use flex-1 to take available space but ensure centering */}
                                <div className="flex-1 flex items-center justify-center relative w-full overflow-hidden min-h-[160px]">
                                    {/* Mystical Background Symbol - Subtle Yin Yang */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-[0.03] font-serif select-none pointer-events-none rotate-12">
                                        ☯
                                    </div>

                                    {/* Vertical Text Container with Fu Tou (Header) */}
                                    <div className="relative z-10 h-full flex flex-col items-center justify-start py-1 gap-1 w-full">

                                        {/* Taoist "Three Pure Ones" (Fu Tou) - Authentic Brush Style */}
                                        <div className="w-10 h-10 text-red-900/90 shrink-0">
                                            <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                                                {/* Three V's with connecting strokes */}
                                                <path d="M15 15 C 15 35, 30 45, 35 15" />
                                                <path d="M42 12 C 42 35, 57 45, 62 12" />
                                                <path d="M70 15 C 70 35, 85 45, 90 15" />
                                                {/* Top horizontal stroke sometimes seen */}
                                                <path d="M10 10 L 95 10" strokeWidth="3" opacity="0.5" />
                                            </svg>
                                        </div>

                                        {/* "Cheng Ling" (Order) - Stylized Block */}
                                        <div className="text-3xl font-serif font-black text-red-950 opacity-90 leading-none shrink-0 mb-2">
                                            敕 令
                                        </div>

                                        {/* Main "Body" - The core purpose script */}
                                        <div className="flex-grow relative flex justify-center items-center w-full">
                                            {/* Decorative 'Magic' Coils (Background) */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                                                <svg width="60" height="200" viewBox="0 0 60 200" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-900">
                                                    <path d="M30 0 Q 60 20 30 40 Q 0 60 30 80 Q 60 100 30 120 Q 0 140 30 160 Q 60 180 30 200" />
                                                </svg>
                                            </div>

                                            {/* The Text itself - Scaled to look like body */}
                                            <div className="text-5xl font-calligraphy writing-vertical-rl font-black tracking-[0.1em] select-none text-red-950 leading-relaxed drop-shadow-[1px_1px_0px_rgba(255,255,255,0.5)] whitespace-nowrap z-10 py-2">
                                                {selectedType.script.replace('敕令 ', '')}
                                            </div>
                                        </div>

                                        {/* "Fu Jiao" (Footer) - Gang Symbol */}
                                        <div className="text-2xl font-serif font-black text-red-950 opacity-80 shrink-0 mt-1">
                                            罡
                                        </div>
                                    </div>

                                    {/* Animated Stamp - Absolute positioned relative to this container */}
                                    <div
                                        className={`absolute bottom-4 right-6 w-20 h-20 border-[3px] border-red-700/80 rounded-xl flex items-center justify-center opacity-0 transition-opacity duration-700 delay-500 mix-blend-multiply z-20 ${isGenerated ? 'opacity-85 scale-100' : 'scale-150'}`}
                                        style={{ transform: isGenerated ? 'rotate(-8deg)' : 'rotate(0deg) scale(1.5)' }}
                                    >
                                        <div className="absolute inset-1 border border-red-700/50 rounded-lg"></div>
                                        <div className="text-red-700 font-serif font-bold text-base leading-tight text-center tracking-widest">
                                            廣行<br />宮印
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="shrink-0 text-center w-full flex flex-col items-center space-y-2 pb-2">
                                    {/* Divider */}
                                    <div className="flex items-center gap-2 w-full justify-center opacity-30">
                                        <div className="h-[1px] w-8 bg-red-900"></div>
                                        <div className="w-1.5 h-1.5 rotate-45 border border-red-900"></div>
                                        <div className="h-[1px] w-8 bg-red-900"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-full px-4">
                                        <span className="text-[9px] font-bold text-red-900/50 tracking-[0.2em] mb-0.5">PRAYER BY</span>
                                        <div className="text-lg font-black text-red-950 border-b border-red-900/20 px-2 w-full max-w-[180px] truncate font-serif">
                                            {userName || '信士姓名'}
                                        </div>
                                    </div>

                                    <div className="text-[9px] text-red-900/40 font-sans tracking-wide pt-1">
                                        {new Date().getFullYear()} ‧ 歲次{new Date().getFullYear() - 1983 > 0 ? '丙午' : '甲辰'}年
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Talisman;