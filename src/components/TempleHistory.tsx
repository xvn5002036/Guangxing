import React from 'react';
import { useData } from '../context/DataContext';

const TempleHistory: React.FC = () => {
    const { siteSettings } = useData();

    return (
        <section id="history" className="py-24 bg-black relative">
            <div className="container mx-auto px-6">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Heritage</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">宮廟沿革</h2>
                    <div className="w-16 h-1 bg-mystic-gold mx-auto mt-6"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-start">

                    {/* Timeline / History Text */}
                    <div className="w-full lg:w-1/2 space-y-12">
                        <div className="relative pl-8 border-l border-mystic-gold/30">
                            <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mystic-gold"></span>
                            <h3 className="text-2xl font-bold text-white mb-4 font-serif">{siteSettings.historyTitle1}</h3>
                            <p className="text-gray-400 leading-relaxed text-justify">
                                {siteSettings.historyDesc1}
                            </p>
                        </div>
                        <div className="relative pl-8 border-l border-mystic-gold/30">
                            <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mystic-gold"></span>
                            <h3 className="text-2xl font-bold text-white mb-4 font-serif">{siteSettings.historyTitle2}</h3>
                            <p className="text-gray-400 leading-relaxed text-justify">
                                {siteSettings.historyDesc2}
                            </p>
                        </div>
                        <div className="relative pl-8 border-l border-mystic-gold/30">
                            <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mystic-gold"></span>
                            <h3 className="text-2xl font-bold text-white mb-4 font-serif">{siteSettings.historyTitle3}</h3>
                            <p className="text-gray-400 leading-relaxed text-justify">
                                {siteSettings.templeName}{siteSettings.historyDesc3}
                            </p>
                        </div>
                    </div>

                    {/* Architecture Visuals */}
                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                        <div className="space-y-4 mt-8">
                            <img src={siteSettings.historyImageRoof} className="w-full h-64 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="Temple Roof" />
                            <div className="bg-mystic-charcoal p-4 border-l-2 border-mystic-gold">
                                <h4 className="text-white font-bold mb-1">{siteSettings.historyRoofTitle}</h4>
                                <p className="text-xs text-gray-500">{siteSettings.historyRoofDesc}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-mystic-charcoal p-4 border-l-2 border-mystic-gold">
                                <h4 className="text-white font-bold mb-1">{siteSettings.historyStoneTitle}</h4>
                                <p className="text-xs text-gray-500">{siteSettings.historyStoneDesc}</p>
                            </div>
                            <img src={siteSettings.historyImageStone} className="w-full h-64 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="Stone Carving" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TempleHistory;