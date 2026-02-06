import React, { useState } from 'react';
import './Ritual.css';

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
    <section id="ritual" className="ritual-container py-24 bg-mystic-charcoal relative border-b border-mystic-gold/10">
       {/* Background Particles (Sparkles) */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(20)].map((_, i) => (
               <div 
                  key={i} 
                  className="bg-particle"
                  style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 4 + 1}px`,
                      height: `${Math.random() * 4 + 1}px`,
                      animationDuration: `${Math.random() * 10 + 5}s`,
                      animationDelay: `${Math.random() * 5}s`
                  }}
               ></div>
           ))}
       </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="mb-12">
            <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">Virtual Ritual</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">線上三柱香</h2>
            <p className="text-gray-400 max-w-xl mx-auto font-light">
                未到廟宇，心亦可誠。點燃心香，向王爺稟報今日來意，祈求平安順遂。
            </p>
        </div>

        <div className="relative h-80 flex items-end justify-center mb-12">
             {/* Enhanced Incense Pot */}
             <div className="incense-pot relative w-64 h-40 rounded-b-3xl flex justify-center items-start pt-4">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-serif text-mystic-gold/20 select-none pot-character">池</div>
                 
                 {/* Incense Sticks */}
                 <div className="absolute -top-[130px] flex gap-12 z-20">
                     {[0, 1, 2].map((i) => (
                         <div key={i} className="relative flex flex-col items-center">
                             {/* Realistic Smoke System */}
                             <div className={`smoke-container ${incenseLit ? 'lit' : ''}`}>
                                 <div className="smoke-particle"></div>
                                 <div className="smoke-particle"></div>
                                 <div className="smoke-particle"></div>
                             </div>

                             {/* Glowing Ember */}
                             <div className={`ember ${incenseLit ? 'lit' : ''}`}></div>

                             {/* Stick Body */}
                             <div className="incense-stick"></div>
                         </div>
                     ))}
                 </div>
                 
                 {/* Ash Fill (Visual only) */}
                 <div className="w-56 h-6 bg-[#8a8a8a] blur-md rounded-full absolute top-2 opacity-30"></div>
             </div>
        </div>

        <button 
            onClick={handleLightIncense}
            disabled={incenseLit}
            className={`px-12 py-4 text-lg tracking-widest uppercase transition-all duration-500 rounded-sm border ${
                incenseLit 
                ? 'bg-transparent text-gray-500 border-gray-800 cursor-default' 
                : 'bg-mystic-crimson text-white border-transparent hover:bg-red-900 shadow-[0_0_20px_rgba(150,0,0,0.5)] hover:shadow-[0_0_30px_rgba(200,0,0,0.7)] transform hover:-translate-y-1'
            }`}
        >
            {incenseLit ? '香火鼎盛' : '點 香 拜 拜'}
        </button>
      </div>
    </section>
  );
};

export default Ritual;