import React, { useState } from 'react';
import { askChiFuWangYe } from '../services/geminiService';
import { OracleResponse, MoonBlockResult } from '../types';
import { Sparkles, RefreshCw, Hand, AlertCircle } from 'lucide-react';

// Realistic Moon Block SVG Component - Widened for realism
const RealisticBlock: React.FC<{ type: 'CONVEX' | 'FLAT'; className?: string; rotation?: number }> = ({ type, className, rotation = 0 }) => {
  return (
    <div 
        className={`${className} drop-shadow-2xl transition-transform duration-700`} 
        style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            {/* Red Glossy Gradient for Convex Side */}
            <radialGradient id="redGloss" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(40 90) rotate(0) scale(100 160)">
                <stop offset="0%" stopColor="#ff4d4d" />
                <stop offset="50%" stopColor="#cc0000" />
                <stop offset="100%" stopColor="#660000" />
            </radialGradient>
            
            {/* Wood Texture Gradient for Flat Side */}
            <linearGradient id="woodFlat" x1="0" y1="0" x2="140" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E6C288" />
                <stop offset="100%" stopColor="#C19A6B" />
            </linearGradient>

            {/* Inner Shadow for Flat Side */}
            <filter id="innerShadow">
                <feOffset dx="2" dy="4" />
                <feGaussianBlur stdDeviation="3" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.3" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
         </defs>

         {/* The Moon Block Shape - Widened/Fattened */}
         {type === 'CONVEX' ? (
             // Rounded Side (Red)
             <g>
                <path 
                    d="M 15,160 Q 135,90 15,20 Q 65,90 15,160 Z" 
                    fill="url(#redGloss)" 
                    stroke="#4a0000" 
                    strokeWidth="1"
                />
                {/* Highlight for 3D effect */}
                <path 
                    d="M 35,140 Q 90,90 35,40" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    opacity="0.2"
                    fill="none"
                />
             </g>
         ) : (
             // Flat Side (Wood)
             <g filter="url(#innerShadow)">
                <path 
                    d="M 15,160 Q 135,90 15,20 Q 65,90 15,160 Z" 
                    fill="url(#woodFlat)" 
                    stroke="#8B5A2B" 
                    strokeWidth="1"
                />
                {/* Simulated Wood Grain Lines */}
                <path d="M 40,50 Q 70,90 40,130" stroke="#8B5A2B" strokeWidth="1" opacity="0.3" fill="none"/>
                <path d="M 60,70 Q 80,90 60,110" stroke="#8B5A2B" strokeWidth="1" opacity="0.3" fill="none"/>
             </g>
         )}
      </svg>
    </div>
  );
};

const Oracle: React.FC = () => {
  const [step, setStep] = useState<'INPUT' | 'THROW' | 'RESULT'>('INPUT');
  const [query, setQuery] = useState('');
  const [moonBlockResult, setMoonBlockResult] = useState<MoonBlockResult>(MoonBlockResult.NONE);
  const [loading, setLoading] = useState(false);
  const [oracleResult, setOracleResult] = useState<OracleResponse | null>(null);
  const [isTossing, setIsTossing] = useState(false);

  // Helper to get random moon block result
  const throwMoonBlocks = () => {
    setIsTossing(true);
    setLoading(true);
    setMoonBlockResult(MoonBlockResult.NONE);
    
    // Simulate toss duration
    setTimeout(() => {
        setIsTossing(false);
        const rand = Math.random();
        let result = MoonBlockResult.SHENG_JIAO;
        
        // Probability: 1/2 Sheng, 1/4 Xiao, 1/4 Yin
        if (rand > 0.75) result = MoonBlockResult.YIN_JIAO; // Two Convex (Angry/No)
        else if (rand > 0.5) result = MoonBlockResult.XIAO_JIAO; // Two Flat (Laugh/Unclear)
        
        setMoonBlockResult(result);
        
        if (result === MoonBlockResult.SHENG_JIAO) {
            // If Holy Cup, immediately ask AI
            setTimeout(() => fetchOracle(), 500); // Small delay before reading
        } else {
            setLoading(false);
        }
    }, 2000); // Longer toss time for realism
  };

  const fetchOracle = async () => {
      try {
          const response = await askChiFuWangYe(query);
          setOracleResult(response);
          setStep('RESULT');
      } catch (e) {
          console.error(e);
          // Handle error
      } finally {
          setLoading(false);
      }
  };

  const handleReset = () => {
      setStep('INPUT');
      setQuery('');
      setMoonBlockResult(MoonBlockResult.NONE);
      setOracleResult(null);
  };

  const handleThrowRetry = () => {
      setMoonBlockResult(MoonBlockResult.NONE);
  };

  return (
    <section id="oracle" className="py-24 bg-mystic-dark relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mystic-gold/5 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">靈籤擲筊</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-mystic-gold to-transparent mx-auto"></div>
        </div>

        {/* STEP 1: INPUT */}
        {step === 'INPUT' && (
            <div className="bg-mystic-charcoal border border-mystic-gold/20 p-8 md:p-12 rounded-sm shadow-2xl animate-float">
                <label className="block text-mystic-gold text-sm tracking-widest mb-4 text-center">
                    請誠心默念 姓名、生辰、住址 及 疑惑
                </label>
                <textarea 
                    rows={5}
                    className="w-full bg-black/50 border border-mystic-gold/30 text-gray-200 p-4 rounded-sm focus:border-mystic-gold outline-none transition-colors mb-8 resize-none text-center text-lg"
                    placeholder="弟子/信女 ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                    onClick={() => { if(query.trim()) setStep('THROW'); }}
                    disabled={!query.trim()}
                    className="w-full py-4 bg-mystic-gold text-black font-bold tracking-[0.2em] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    開始擲筊
                </button>
            </div>
        )}

        {/* STEP 2: THROW BLOCKS */}
        {step === 'THROW' && (
            <div className="text-center">
                 <div className="h-80 flex items-center justify-center mb-4 relative perspective-1000">
                    
                    {/* The Tossing Area */}
                    <div className="relative w-72 h-72 flex justify-center items-center">
                         
                         {/* Idle State: Holding two Convex sides up (Standard holding posture) */}
                         {!isTossing && moonBlockResult === MoonBlockResult.NONE && (
                             <div className="flex gap-4 animate-float">
                                 <RealisticBlock type="CONVEX" rotation={-10} className="scale-100" />
                                 <RealisticBlock type="CONVEX" rotation={10} className="scale-100" />
                             </div>
                         )}

                         {/* Tossing State: Rapid Animation */}
                         {isTossing && (
                             <div className="flex gap-12 animate-toss">
                                 {/* Blurring them slightly to simulate speed */}
                                 <RealisticBlock type="CONVEX" rotation={0} className="blur-[2px]" />
                                 <RealisticBlock type="FLAT" rotation={180} className="blur-[2px]" />
                             </div>
                         )}

                         {/* Result State */}
                         {!isTossing && moonBlockResult !== MoonBlockResult.NONE && (
                             <div className="flex gap-12 animate-fade-in-up">
                                 {/* Left Block */}
                                 <RealisticBlock 
                                    type={moonBlockResult === MoonBlockResult.XIAO_JIAO || moonBlockResult === MoonBlockResult.SHENG_JIAO ? 'FLAT' : 'CONVEX'} 
                                    rotation={-15} 
                                 />
                                 {/* Right Block */}
                                 <RealisticBlock 
                                    type={moonBlockResult === MoonBlockResult.XIAO_JIAO ? 'FLAT' : 'CONVEX'} 
                                    rotation={15} 
                                 />
                             </div>
                         )}

                         {/* Shadow (Dynamic) */}
                         <div className={`absolute bottom-0 w-48 h-8 bg-black/50 rounded-full blur-xl transition-all duration-300 ${isTossing ? 'scale-50 opacity-20' : 'scale-100 opacity-60'}`}></div>
                    </div>
                 </div>

                 {/* Text Status */}
                 <div className="h-24 flex items-center justify-center">
                    {loading ? (
                        <div className="text-mystic-gold tracking-widest text-xl animate-pulse font-bold">
                            {isTossing ? "誠心祈求..." : 
                             (moonBlockResult === MoonBlockResult.SHENG_JIAO ? "聖筊！讀取天機..." : 
                              moonBlockResult === MoonBlockResult.XIAO_JIAO ? "笑筊" : "陰筊")}
                        </div>
                    ) : (
                       <div className="space-y-4">
                           {moonBlockResult === MoonBlockResult.NONE ? (
                               <>
                                <p className="text-gray-300 mb-2">請點擊下方按鈕擲筊</p>
                                <button 
                                    onClick={throwMoonBlocks}
                                    className="px-12 py-4 border border-mystic-gold text-mystic-gold hover:bg-mystic-gold hover:text-black transition-all tracking-[0.2em] font-bold rounded-sm shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                                >
                                    <Hand className="inline-block w-5 h-5 mr-2 mb-1" />
                                    擲 筊
                                </button>
                               </>
                           ) : (
                               <div className="flex flex-col items-center gap-4">
                                   <p className="text-gray-400">
                                       {moonBlockResult === MoonBlockResult.XIAO_JIAO ? '王爺笑而不語，請再次誠心說明。' : '時機未到或誠意不足，請重新稟報。'}
                                   </p>
                                   <div className="flex justify-center gap-4">
                                       <button 
                                           onClick={handleThrowRetry}
                                           className="px-8 py-3 bg-mystic-red text-white hover:bg-red-800 transition-colors rounded-sm"
                                       >
                                           {moonBlockResult === MoonBlockResult.YIN_JIAO ? '重新稟報' : '再次請示'}
                                       </button>
                                       {moonBlockResult === MoonBlockResult.YIN_JIAO && (
                                           <button 
                                               onClick={() => setStep('INPUT')}
                                               className="px-8 py-3 border border-gray-600 text-gray-400 hover:text-white rounded-sm"
                                           >
                                               修改疏文
                                           </button>
                                       )}
                                   </div>
                               </div>
                           )}
                       </div>
                    )}
                 </div>
            </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'RESULT' && oracleResult && (
            <div className="bg-mystic-charcoal p-8 md:p-16 border-t-4 border-mystic-gold shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Poem Column */}
                    <div className="w-full md:w-1/3 border-r border-gray-800 pr-8">
                        <h3 className="text-mystic-gold tracking-[0.5em] text-lg mb-8 text-center md:text-left">第七十八首</h3>
                        <div className="vertical-rl h-[300px] text-2xl md:text-3xl font-serif text-white leading-loose tracking-widest mx-auto md:mx-0">
                            {oracleResult.poem}
                        </div>
                    </div>
                    
                    {/* Interpretation Column */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <div>
                            <h4 className="text-mystic-gold font-bold mb-2 flex items-center gap-2">
                                <Sparkles size={16} /> 解曰
                            </h4>
                            <p className="text-gray-300 leading-loose text-justify border-l-2 border-gray-700 pl-4">
                                {oracleResult.interpretation}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-mystic-gold font-bold mb-2 flex items-center gap-2">
                                <AlertCircle size={16} /> 指引
                            </h4>
                            <p className="text-gray-300 leading-loose text-justify border-l-2 border-gray-700 pl-4">
                                {oracleResult.advice}
                            </p>
                        </div>
                        
                        <div className="pt-8 text-center md:text-right">
                            <button 
                                onClick={handleReset}
                                className="text-sm text-gray-500 hover:text-white flex items-center justify-end gap-2 ml-auto"
                            >
                                <RefreshCw size={14} /> 叩謝神恩 (重置)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </section>
  );
};

export default Oracle;