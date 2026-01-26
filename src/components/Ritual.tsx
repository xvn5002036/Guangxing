import React, { useState } from 'react';

const Ritual: React.FC = () => {
  const [incenseLit, setIncenseLit] = useState(false);

  const handleLightIncense = () => {
    setIncenseLit(true);
    // Could play audio here in a real implementation
    setTimeout(() => {
        // Reset after animation loop if desired, or keep it lit
    }, 5000);
  };

  return (
    <section id="ritual" className="py-24 bg-mystic-charcoal relative border-b border-mystic-gold/10 overflow-hidden">
       {/* Background Smoke Effect */}
       <div className="absolute inset-0 opacity-10 bg-smoke animate-pulse"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-12">
            <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Virtual Ritual</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">線上三柱香</h2>
            <p className="text-gray-400 max-w-xl mx-auto font-light">
                未到廟宇，心亦可誠。點燃心香，向王爺稟報今日來意，祈求平安順遂。
            </p>
        </div>

        <div className="relative h-80 flex items-end justify-center mb-12">
             {/* Incense Pot Image (Placeholder construction) */}
             <div className="relative w-64 h-40 bg-gradient-to-b from-stone-800 to-stone-900 rounded-b-3xl border-t-8 border-stone-700 shadow-2xl flex justify-center items-start pt-4">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-serif text-mystic-gold/20 select-none">池</div>
                 
                 {/* Incense Sticks */}
                 <div className="absolute -top-32 flex gap-8">
                     {[0, 1, 2].map((i) => (
                         <div key={i} className="relative flex flex-col items-center">
                             {/* Smoke */}
                             <div className={`w-8 h-32 absolute -top-28 transition-opacity duration-1000 ${incenseLit ? 'opacity-60' : 'opacity-0'}`}>
                                 <div className="w-full h-full bg-gray-400 blur-xl animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }}></div>
                             </div>
                             {/* Ember */}
                             <div className={`w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red] mb-1 transition-opacity duration-500 ${incenseLit ? 'opacity-100' : 'opacity-0'}`}></div>
                             {/* Stick */}
                             <div className="w-1.5 h-32 bg-stone-500 rounded-t-sm bg-gradient-to-b from-red-800 to-yellow-900"></div>
                         </div>
                     ))}
                 </div>
                 {/* Ash */}
                 <div className="w-56 h-8 bg-stone-400/20 blur-sm rounded-full absolute top-2"></div>
             </div>
        </div>

        <button 
            onClick={handleLightIncense}
            disabled={incenseLit}
            className={`px-10 py-4 text-lg tracking-widest uppercase transition-all duration-500 ${
                incenseLit 
                ? 'bg-transparent text-gray-500 border border-gray-700 cursor-default' 
                : 'bg-mystic-crimson text-white hover:bg-red-900 shadow-[0_0_20px_rgba(150,0,0,0.5)]'
            }`}
        >
            {incenseLit ? '香火鼎盛' : '點 香 拜 拜'}
        </button>
      </div>
    </section>
  );
};

export default Ritual;