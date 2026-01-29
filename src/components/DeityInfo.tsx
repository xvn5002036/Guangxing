import React from 'react';
import { useData } from '../context/DataContext';

const DeityInfo: React.FC = () => {
  const { siteSettings } = useData();

  return (
    <section id="about" className="py-24 bg-mystic-charcoal relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
            
            {/* Image Section - UPDATED IMAGE (Detailed Dragon Robe / Statue Close-up) */}
            <div className="w-full md:w-1/2">
                <div className="relative group">
                    <div className="absolute inset-0 bg-mystic-gold blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
                    <div className="relative z-10 w-full h-[600px] overflow-hidden rounded-sm border-2 border-white/5">
                        <img 
                            src={siteSettings.deityImage}
                            alt="Deity Statue Detail" 
                            className="w-full h-full object-cover grayscale brightness-50 contrast-125 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-[1.5s]"
                        />
                    </div>
                    {/* Decorative Frame Element */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-mystic-gold/30 z-20 hidden md:block"></div>
                </div>
            </div>

            {/* Text Section */}
            <div className="w-full md:w-1/2 space-y-8">
                <div>
                    <span className="text-mystic-gold tracking-[0.3em] text-sm font-bold uppercase">The Legend</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6 font-serif">{siteSettings.deityTitle}</h2>
                    <p className="text-gray-400 leading-relaxed font-light text-justify text-lg whitespace-pre-wrap">
                        {siteSettings.deityIntro}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-6 border-l-2 border-mystic-gold/50 hover:bg-mystic-gold/10 transition-colors">
                        <h4 className="text-white font-bold mb-1 text-xl">{siteSettings.deityBirthday}</h4>
                        <p className="text-gray-500 text-sm tracking-wider">{siteSettings.deityBirthdayLabel}</p>
                    </div>
                    <div className="bg-black/40 p-6 border-l-2 border-mystic-gold/50 hover:bg-mystic-gold/10 transition-colors">
                        <h4 className="text-white font-bold mb-1 text-xl">{siteSettings.deityDuty}</h4>
                        <p className="text-gray-500 text-sm tracking-wider">{siteSettings.deityDutyLabel}</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default DeityInfo;