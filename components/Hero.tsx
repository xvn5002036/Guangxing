import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-[90vh] w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Video/Image with Ken Burns effect - UPDATED IMAGE (Dark, Dramatic Temple Roof/Smoke) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 animate-[pulse-slow_12s_ease-in-out_infinite]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1592388796690-3482d8d8091e?q=80&w=2600&auto=format&fit=crop")' }} 
      ></div>
      
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark via-mystic-dark/30 to-black/80"></div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-4 pt-20">
        <div className="mb-8 animate-float inline-block relative group cursor-default">
            <div className="absolute -inset-4 bg-mystic-gold/20 rounded-full blur-xl group-hover:bg-mystic-gold/40 transition-all duration-500"></div>
            <div className="w-20 h-20 border border-mystic-gold/50 rotate-45 flex items-center justify-center mx-auto bg-black relative z-10">
                <div className="w-16 h-16 border border-mystic-gold bg-mystic-gold/10 -rotate-45 flex items-center justify-center">
                    <span className="text-mystic-gold font-calligraphy text-3xl">池</span>
                </div>
            </div>
        </div>

        <h1 className="text-6xl md:text-9xl font-bold text-white mb-6 tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] font-calligraphy">
          代天巡狩
        </h1>
        
        <div className="flex items-center justify-center gap-4 text-mystic-gold tracking-[0.6em] text-sm md:text-xl font-light uppercase mb-12">
            <span className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-mystic-gold"></span>
            威靈顯赫 · 廣行濟世
            <span className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-mystic-gold"></span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
                href="#talisman"
                className="group relative px-8 py-3 bg-mystic-gold overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.6)]"
            >
                <div className="absolute inset-0 w-0 bg-white transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
                <span className="relative text-black font-bold tracking-widest">
                    祈求平安符
                </span>
            </a>
            <a 
                href="#oracle"
                className="px-8 py-3 border border-mystic-gold/50 text-mystic-gold font-bold tracking-widest hover:bg-mystic-gold/10 transition-colors duration-300"
            >
                線上靈籤
            </a>
        </div>
      </div>

      <div className="absolute bottom-12 animate-bounce text-mystic-gold/50">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;