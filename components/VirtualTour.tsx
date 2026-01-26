
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Compass, Map, Scan, XCircle, Sparkles, Navigation, Info } from 'lucide-react';

const BLESSINGS = [
    "池府王爺賜福：身體健康，萬事如意。",
    "見靈光者，得神光普照，前途光明。",
    "心誠則靈，厄運退散，好運降臨。",
    "廣行濟世，功德無量，闔家平安。",
    "王爺敕令：出入平安，財源廣進。"
];

const VirtualTour: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [spiritFound, setSpiritFound] = useState(false);
  const [blessing, setBlessing] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startAR = async () => {
    setIsActive(true);
    setSpiritFound(false);
    setBlessing('');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // Prefer back camera
        });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setHasPermission(true);
        
        // Start scanning simulation
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setSpiritFound(true);
        }, 3000); // Find spirit after 3 seconds

    } catch (err) {
        console.error("Camera access denied:", err);
        setHasPermission(false);
    }
  };

  const stopAR = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setIsActive(false);
    setScanning(false);
  };

  const handleSpiritClick = () => {
     const randomBlessing = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
     setBlessing(randomBlessing);
     setSpiritFound(false); // Hide spirit after clicking
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  return (
    <section id="ar-tour" className="py-24 bg-mystic-dark relative border-t border-mystic-gold/10 overflow-hidden">
      
      {/* Intro View */}
      {!isActive && (
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="mb-12">
                <span className="text-mystic-gold text-xs tracking-[0.3em] uppercase block mb-2">AR Experience</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white font-serif">虛擬實境導覽</h2>
                <p className="text-gray-400 mt-4 max-w-xl mx-auto">
                    開啟您的「天眼」，透過手機鏡頭尋找隱藏在空間中的神明靈光。結合現代科技與傳統信仰，體驗身歷其境的宮廟巡禮。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-mystic-charcoal p-8 border border-white/5 rounded-sm flex flex-col items-center group hover:border-mystic-gold/50 transition-all">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-mystic-gold/30">
                        <Camera className="text-mystic-gold" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">尋找靈光 (AR)</h3>
                    <p className="text-sm text-gray-500 mb-6">開啟相機，在真實環境中探索神蹟。</p>
                    <button 
                        onClick={startAR}
                        className="px-8 py-3 bg-mystic-gold text-black font-bold tracking-widest hover:bg-white transition-colors rounded-sm"
                    >
                        開啟天眼
                    </button>
                </div>

                <div className="bg-mystic-charcoal p-8 border border-white/5 rounded-sm flex flex-col items-center group hover:border-mystic-gold/50 transition-all relative overflow-hidden">
                     {/* Placeholder for 360 view link - simulated */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566708343003-88f5c35f0f38?q=80&w=800&auto=format&fit=crop')] bg-cover opacity-20 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-mystic-gold/30">
                            <Map className="text-blue-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">360° 全景參拜</h3>
                        <p className="text-sm text-gray-500 mb-6">身歷其境，線上遊覽宮廟殿堂。</p>
                        <button className="px-8 py-3 border border-gray-600 text-gray-300 font-bold tracking-widest hover:border-white hover:text-white transition-colors rounded-sm cursor-not-allowed opacity-70">
                            建置中
                        </button>
                    </div>
                </div>
            </div>
          </div>
      )}

      {/* AR Active View */}
      {isActive && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
              
              {/* Top Bar (HUD) */}
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-mono text-xs tracking-widest">LIVE FEED</span>
                  </div>
                  <button onClick={stopAR} className="p-2 bg-black/50 border border-white/20 rounded-full text-white hover:bg-red-900/50 hover:border-red-500 transition-all">
                      <XCircle size={24} />
                  </button>
              </div>

              {/* Camera Feed */}
              {hasPermission === true ? (
                  <div className="relative w-full h-full">
                      <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                      ></video>
                      
                      {/* HUD Overlay Elements */}
                      <div className="absolute inset-0 pointer-events-none">
                          {/* Crosshair */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-mystic-gold/30 rounded-full flex items-center justify-center opacity-50">
                              <div className="w-1 h-4 bg-mystic-gold absolute top-0"></div>
                              <div className="w-1 h-4 bg-mystic-gold absolute bottom-0"></div>
                              <div className="w-4 h-1 bg-mystic-gold absolute left-0"></div>
                              <div className="w-4 h-1 bg-mystic-gold absolute right-0"></div>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>

                          {/* Tech Decorative Lines */}
                          <div className="absolute bottom-20 left-6 text-mystic-gold/70 font-mono text-xs space-y-1">
                              <div>LAT: 25.0330° N</div>
                              <div>LNG: 121.5654° E</div>
                              <div className="flex items-center gap-2 mt-2">
                                  <Compass size={14} />
                                  <span>方位: 西北偏北</span>
                              </div>
                          </div>
                          
                          {/* Scanning Text */}
                          {scanning && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-40 bg-black/60 px-4 py-2 rounded border border-mystic-gold/50 text-mystic-gold animate-pulse font-mono flex items-center gap-2">
                                  <Scan size={16} /> 偵測靈氣中...
                              </div>
                          )}
                      </div>

                      {/* AR Object: Spirit Orb */}
                      {spiritFound && !blessing && (
                          <button 
                            onClick={handleSpiritClick}
                            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-[float_4s_ease-in-out_infinite] cursor-pointer z-30 group"
                          >
                              {/* Orb Core */}
                              <div className="absolute inset-0 bg-mystic-gold rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                              <div className="absolute inset-4 bg-white rounded-full blur-sm animate-pulse"></div>
                              {/* Rings */}
                              <div className="absolute inset-0 border-2 border-mystic-gold rounded-full animate-[spin-slow_10s_linear_infinite] opacity-60"></div>
                              <div className="absolute -inset-4 border border-dashed border-white/50 rounded-full animate-[spin-slow_15s_linear_infinite_reverse] opacity-40"></div>
                              
                              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-xs font-bold tracking-widest bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                                  點擊接收神恩
                              </div>
                          </button>
                      )}

                      {/* Result: Blessing Modal */}
                      {blessing && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in-up">
                              <div className="bg-mystic-charcoal border-2 border-mystic-gold p-8 rounded-sm shadow-[0_0_50px_rgba(197,160,89,0.5)] text-center max-w-md relative">
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-mystic-dark p-3 rounded-full border border-mystic-gold">
                                      <Sparkles className="text-mystic-gold" size={32} />
                                  </div>
                                  <h3 className="text-2xl font-bold text-white mt-4 mb-2">天賜吉兆</h3>
                                  <div className="w-16 h-1 bg-gradient-to-r from-transparent via-mystic-gold to-transparent mx-auto mb-6"></div>
                                  <p className="text-xl text-mystic-gold font-serif leading-relaxed mb-8">
                                      {blessing}
                                  </p>
                                  <button 
                                    onClick={() => { setBlessing(''); setScanning(true); setTimeout(() => { setScanning(false); setSpiritFound(true); }, 5000); }}
                                    className="px-6 py-2 bg-gray-800 text-gray-300 hover:bg-white hover:text-black transition-colors rounded text-sm mr-4"
                                  >
                                      繼續尋找
                                  </button>
                                  <button 
                                    onClick={stopAR}
                                    className="px-6 py-2 bg-mystic-gold text-black font-bold hover:bg-white transition-colors rounded text-sm"
                                  >
                                      收入行囊 (關閉)
                                  </button>
                              </div>
                          </div>
                      )}

                  </div>
              ) : hasPermission === false ? (
                  <div className="text-center p-8 max-w-md">
                      <XCircle size={64} className="text-red-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-white mb-4">無法開啟天眼</h3>
                      <p className="text-gray-400 mb-6">
                          請允許瀏覽器使用相機權限，或確認您的裝置是否支援 WebAR 功能。<br/>
                          (建議使用手機瀏覽器體驗)
                      </p>
                      <button onClick={stopAR} className="px-8 py-3 bg-white text-black font-bold rounded">返回首頁</button>
                  </div>
              ) : (
                  <div className="text-center">
                      <div className="w-12 h-12 border-4 border-mystic-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-mystic-gold tracking-widest">啟動術法陣列中...</p>
                  </div>
              )}
          </div>
      )}
    </section>
  );
};

export default VirtualTour;
