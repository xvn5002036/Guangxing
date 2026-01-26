import React, { useState } from 'react';
import { TalismanConfig, TalismanType } from '../types';
import { Download, Sparkles, Stamp } from 'lucide-react';

const talismanTypes: TalismanConfig[] = [
  { type: 'SAFETY', label: '出入平安', name: '平安符', script: '敕令 平安' },
  { type: 'WEALTH', label: '財源廣進', name: '招財符', script: '敕令 招財' },
  { type: 'LOVE', label: '良緣天成', name: '姻緣符', script: '敕令 姻緣' },
  { type: 'HEALTH', label: '身體健康', name: '護身符', script: '敕令 卻病' },
];

const Talisman: React.FC = () => {
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
                                        className={`p-4 border text-center transition-all ${
                                            selectedType.type === t.type 
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
                <div className={`relative w-[300px] h-[500px] bg-mystic-paper shadow-[0_0_50px_rgba(255,215,0,0.1)] transition-all duration-1000 transform ${isAnimating ? 'rotate-y-180 scale-95 blur-sm' : 'rotate-y-0 scale-100'}`}>
                    
                    {/* Paper Texture */}
                    <div className="absolute inset-0 talisman-bg opacity-50"></div>
                    
                    {/* Borders & Decorations - Fixed Position */}
                    <div className="absolute inset-3 border-2 border-red-800 opacity-80 pointer-events-none rounded-sm"></div>
                    <div className="absolute inset-4 border border-red-800 opacity-50 pointer-events-none rounded-sm"></div>
                    {/* Corner accents */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-red-900"></div>
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-red-900"></div>
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-red-900"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-red-900"></div>

                    {/* Safe Content Area - Strictly confined inside borders with more breathing room */}
                    <div className="absolute top-6 bottom-6 left-6 right-6 flex flex-col items-center justify-between text-red-900 z-10">
                        
                        {/* Header Section (Shrinkable) */}
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <div className="text-xs font-bold tracking-[0.2em] opacity-60">新莊武壇</div>
                            <div className="font-calligraphy text-3xl font-bold">廣行宮</div>
                            <div className="w-8 h-8 mt-1 border-2 border-red-800/60 rounded-full flex items-center justify-center">
                                <span className="font-serif font-bold text-xs opacity-80">靈符</span>
                            </div>
                        </div>

                        {/* Main Script (Growable Center) */}
                        <div className="flex-grow flex items-center justify-center relative w-full overflow-hidden">
                            <div className="text-5xl font-calligraphy vertical-rl font-bold tracking-[0.2em] select-none drop-shadow-sm text-red-950 leading-relaxed py-2">
                                {selectedType.script}
                            </div>
                            
                            {/* Stamp Animation Overlay */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-red-600 rounded-sm flex items-center justify-center opacity-0 transition-opacity duration-1000 delay-500 ${isGenerated ? 'opacity-80 scale-100' : 'scale-150'}`} style={{ transform: 'translate(-50%, -50%) rotate(-15deg)' }}>
                                <div className="text-red-600 font-serif font-bold text-lg border-2 border-red-600 p-1 leading-tight text-center">
                                    王爺<br/>敕印
                                </div>
                            </div>
                        </div>

                        {/* Footer Section (Shrinkable) */}
                        <div className="shrink-0 text-center w-full flex flex-col items-center">
                             <div className="w-12 h-[1px] bg-red-900/20 mb-2"></div>
                             
                             <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[10px] font-bold text-red-900/60">信士</span>
                                <div className="text-xl font-black text-red-950 border-b-2 border-red-900/30 pb-0.5 px-2 min-w-[100px] max-w-[200px] truncate leading-tight">
                                    {userName || '_______'}
                                </div>
                                <span className="text-base font-bold text-red-900 mt-1">虔誠供奉</span>
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