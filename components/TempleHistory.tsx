import React from 'react';

const TempleHistory: React.FC = () => {
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
                    <h3 className="text-2xl font-bold text-white mb-4 font-serif">草創時期 (清乾隆年間)</h3>
                    <p className="text-gray-400 leading-relaxed text-justify">
                        本宮源起於清乾隆年間，先民渡海來台，為求平安渡過黑水溝，隨身奉請池府王爺金身。初時僅以茅草搭建簡易神壇供奉，然神威顯赫，庇佑庄頭五穀豐登，信眾日增。
                    </p>
                </div>
                <div className="relative pl-8 border-l border-mystic-gold/30">
                    <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mystic-gold"></span>
                    <h3 className="text-2xl font-bold text-white mb-4 font-serif">建廟大業 (民國六十年)</h3>
                    <p className="text-gray-400 leading-relaxed text-justify">
                        隨著地方繁榮，舊壇已不敷使用。地方仕紳與信眾集資購地，依循古法地理勘輿，擇定現址動土興建。歷時三年，大殿巍峨聳立，燕尾飛簷，剪黏交趾，展現傳統工藝之美。
                    </p>
                </div>
                <div className="relative pl-8 border-l border-mystic-gold/30">
                    <span className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-mystic-gold"></span>
                    <h3 className="text-2xl font-bold text-white mb-4 font-serif">現代弘法 (今日)</h3>
                    <p className="text-gray-400 leading-relaxed text-justify">
                        新莊武壇廣行宮不僅是信仰中心，更致力於公益慈善與文化傳承。引入數位科技，設立線上祭祀平台，讓傳統信仰跨越時空，繼續守護每一位虔誠的靈魂。
                    </p>
                </div>
            </div>

            {/* Architecture Visuals */}
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                     <img src="https://images.unsplash.com/photo-1542649761-0af3759b9e6f?q=80&w=1000&auto=format&fit=crop" className="w-full h-64 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="Temple Roof" />
                     <div className="bg-mystic-charcoal p-4 border-l-2 border-mystic-gold">
                        <h4 className="text-white font-bold mb-1">燕尾脊</h4>
                        <p className="text-xs text-gray-500">象徵尊貴地位，飛簷翹角，氣勢非凡。</p>
                     </div>
                </div>
                <div className="space-y-4">
                     <div className="bg-mystic-charcoal p-4 border-l-2 border-mystic-gold">
                        <h4 className="text-white font-bold mb-1">龍柱石雕</h4>
                        <p className="text-xs text-gray-500">匠師精雕細琢，雙龍搶珠，栩栩如生。</p>
                     </div>
                     <img src="https://images.unsplash.com/photo-1596545753969-583d73b3eb38?q=80&w=1000&auto=format&fit=crop" className="w-full h-64 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700" alt="Stone Carving" />
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default TempleHistory;