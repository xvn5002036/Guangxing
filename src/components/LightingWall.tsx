
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const LightingWall: React.FC = () => {
    const { registrations, services, siteSettings } = useData();
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Identify which services are of type 'LIGHT'
    const lightServiceIds = useMemo(() => {
        return services.filter(s => s.type === 'LIGHT').map(s => s.id);
    }, [services]);

    // 2. Filter registrations that are (1) for lights and (2) PROCESSED by admin
    const activeLights = useMemo(() => {
        return registrations.filter(r =>
            lightServiceIds.includes(r.serviceId) &&
            r.isProcessed === true // CRITICAL: Only show if Admin marked as processed
        );
    }, [registrations, lightServiceIds]);

    // Search filter
    const filteredLights = useMemo(() => {
        if (!searchTerm) return activeLights;
        return activeLights.filter(l => l.name.includes(searchTerm) || l.phone.includes(searchTerm));
    }, [activeLights, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(Math.max(filteredLights.length, 1) / ITEMS_PER_PAGE);

    // Get current page items
    const currentItems = useMemo(() => {
        const start = currentPage * ITEMS_PER_PAGE;
        // We always want to show placeholders if fewer than 10 items, or just the items?
        // Let's grab the actual items first
        const items = filteredLights.slice(start, start + ITEMS_PER_PAGE);

        // Fill the rest with "Empty/Available" slots to maintain the "Wall" look of 10 units
        const filledItems = [...items];
        while (filledItems.length < ITEMS_PER_PAGE) {
            filledItems.push(null as any);
        }
        return filledItems;
    }, [filteredLights, currentPage]);

    const handlePrev = () => setCurrentPage(p => Math.max(0, p - 1));
    const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

    // Determine if the Deity should glow (if there are any lights on this page)
    const isDeityGlowing = currentItems.some(item => item !== null);

    return (
        <section id="lighting-wall" className="py-24 bg-black relative overflow-hidden border-t border-white/10">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-50"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Blessing Wall</span>
                    <h2 className="text-[clamp(1.875rem,5vw,3rem)] font-bold text-white font-serif">線上光明燈牆</h2>
                    <p className="text-gray-500 mt-4 text-sm max-w-lg mx-auto">
                        每一盞燈，都是一份虔誠的祈願。當您完成報名並經廟方受理後，您的名字將在此點亮，受神光普照。
                    </p>
                </div>

                {/* Search & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto mb-8 gap-4">
                    <div className="text-mystic-gold font-bold border border-mystic-gold/30 px-4 py-2 rounded-full bg-black/50 text-sm">
                        目前點燈信眾：{activeLights.length} 位
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="搜尋信眾姓名..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                            className="pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-full text-white text-sm focus:border-mystic-gold outline-none w-64"
                        />
                    </div>
                </div>

                {/* THE WALL CONTAINER */}
                <div className="max-w-6xl mx-auto relative">

                    {/* Pagination Controls - Absolute on desktop */}
                    <button
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-3 rounded-full bg-mystic-charcoal border border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage >= totalPages - 1}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-3 rounded-full bg-mystic-charcoal border border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Main Display Area */}
                    <div className="bg-mystic-charcoal/80 border-4 border-yellow-900/50 rounded-lg p-6 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden min-h-[600px] flex flex-col items-center">

                        {/* 1. THE DEITY (Top Center) */}
                        {/* 1. THE DEITY (Top Center) */}
                        <div className="relative mb-16 group z-20">
                            {/* Divine Light / Halo Background */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[300px] h-[300px] rounded-full transition-all duration-1000 ${isDeityGlowing ? 'bg-gradient-radial from-yellow-400/30 via-yellow-600/10 to-transparent blur-3xl opacity-100' : 'bg-transparent opacity-0'}`}></div>

                            {/* Deity Image Frame - Arch Shape */}
                            <div className={`relative w-48 h-64 md:w-56 md:h-72 mx-auto rounded-t-full border-[3px] ${isDeityGlowing ? 'border-yellow-500/80 shadow-[0_0_50px_rgba(255,215,0,0.5)]' : 'border-white/10'} overflow-hidden bg-gradient-to-b from-gray-900 to-black transition-all duration-1000 transform group-hover:scale-105`}>

                                {/* Placeholder / Fallback Pattern if image empty */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

                                {siteSettings.deityImage ? (
                                    <img
                                        src={siteSettings.deityImage}
                                        alt={siteSettings.deityTitle || "Main Deity"}
                                        className={`w-full h-full object-cover object-top transition-all duration-1000 ${isDeityGlowing ? 'brightness-110 contrast-110 saturate-110' : 'brightness-50 grayscale'}`}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-700 font-serif">
                                        <span>(請設定神尊照片)</span>
                                    </div>
                                )}

                                {/* Inner Shine Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                            </div>

                            {/* Altar Base / Nameplate */}
                            <div className="relative -mt-4 mx-auto w-64 md:w-72">
                                {/* Base Decoration */}
                                <div className="absolute inset-x-4 top-0 h-1 bg-yellow-600/50 blur-[2px]"></div>
                                <div className="bg-gradient-to-b from-yellow-950 via-red-950 to-black border-t-2 border-yellow-700/80 rounded-sm shadow-xl py-2 px-4 relative overflow-hidden">
                                    {/* Gold Speckles */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

                                    <div className="relative text-center">
                                        <div className="text-[10px] text-yellow-500/80 tracking-[0.5em] mb-0.5 uppercase">Main Deity</div>
                                        <h3 className="text-xl font-bold text-white font-serif tracking-widest drop-shadow-md">
                                            {siteSettings.templeName}
                                        </h3>
                                    </div>
                                </div>
                                {/* Shadow below base */}
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/50 blur-xl"></div>
                            </div>
                        </div>

                        {/* 2. THE LIGHTS GRID (10 Units) */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 w-full relative z-10">
                            {currentItems.map((light, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    {/* The Lamp Object */}
                                    <div className={`relative w-full aspect-[3/4] rounded-t-full border-2 transition-all duration-700 flex flex-col items-center justify-end overflow-hidden group
                                ${light
                                            ? 'bg-gradient-to-b from-yellow-900/80 via-red-900/50 to-black border-yellow-500 shadow-[0_0_20px_rgba(255,165,0,0.4)]'
                                            : 'bg-black/40 border-gray-800 opacity-50'
                                        }`}
                                    >
                                        {/* Light Source (Top) */}
                                        {light && (
                                            <div className="absolute top-4 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_5px_rgba(255,255,0,1)] animate-pulse"></div>
                                        )}

                                        {/* Inner Glow */}
                                        {light && (
                                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent"></div>
                                        )}

                                        {/* Name Tag (Vertical) */}
                                        <div className="relative z-10 py-6 w-full text-center">
                                            {light ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] text-yellow-300/80 tracking-widest">{light.serviceTitle.substring(0, 2)}</span>
                                                    <div className="w-6 h-[1px] bg-yellow-500/50 my-1"></div>
                                                    <div className="text-xl md:text-2xl font-bold text-white writing-vertical-rl font-serif tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                                        {light.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full opacity-30">
                                                    <div className="text-lg text-gray-500 font-serif writing-vertical-rl tracking-widest">
                                                        平安
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Number Tag */}
                                    <div className={`mt-2 text-[10px] tracking-widest ${light ? 'text-yellow-500' : 'text-gray-700'}`}>
                                        NO. {(currentPage * ITEMS_PER_PAGE) + index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Page Indicator */}
                        <div className="mt-12 flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-mystic-gold w-6' : 'bg-gray-700 hover:bg-gray-500'}`}
                                />
                            ))}
                        </div>

                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <a href="#services" className="inline-flex items-center gap-2 px-8 py-3 bg-mystic-red text-white font-bold tracking-widest rounded-sm hover:bg-red-800 transition-colors shadow-lg">
                        <Sparkles size={18} />
                        我也要點燈
                    </a>
                </div>

            </div>
        </section>
    );
};

export default LightingWall;
