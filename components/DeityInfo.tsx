import React from 'react';

const DeityInfo: React.FC = () => {
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
                            src="https://images.unsplash.com/photo-1616401776943-41c0f04df518?q=80&w=2000&auto=format&fit=crop" 
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
                    <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6 font-serif">傳奇緣起</h2>
                    <p className="text-gray-400 leading-relaxed font-light text-justify text-lg">
                        池府王爺，諱夢彪，唐朝名將。性格剛正，愛民如子。傳說王爺於夢中見瘟神奉玉帝旨意降災，欲於井中投毒。王爺不忍百姓受難，毅然奪藥吞服，捨身救民。
                        <br/><br/>
                        毒發之時，面色黝黑，雙目暴突。玉帝感其大德，敕封「代天巡狩」，專司驅瘟除疫。今人所見王爺金身之<span className="text-white border-b border-mystic-gold">黑面怒目</span>，實乃慈悲之至極。
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-6 border-l-2 border-mystic-gold/50 hover:bg-mystic-gold/10 transition-colors">
                        <h4 className="text-white font-bold mb-1 text-xl">農曆六月十八</h4>
                        <p className="text-gray-500 text-sm tracking-wider">聖誕千秋</p>
                    </div>
                    <div className="bg-black/40 p-6 border-l-2 border-mystic-gold/50 hover:bg-mystic-gold/10 transition-colors">
                        <h4 className="text-white font-bold mb-1 text-xl">消災 · 解厄</h4>
                        <p className="text-gray-500 text-sm tracking-wider">專司職責</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default DeityInfo;