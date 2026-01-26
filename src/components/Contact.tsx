
import React from 'react';
import { MapPin, Bus, Car, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const Contact: React.FC = () => {
  const { siteSettings } = useData();
  
  // Construct map query based on address
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(siteSettings.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact-info" className="py-24 bg-mystic-dark relative border-t border-mystic-gold/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Info */}
            <div className="w-full lg:w-1/3 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">交通指引 & 聯絡</h2>
                    <p className="text-gray-400 mb-8">歡迎蒞臨{siteSettings.templeName}參香祈福，或透過線上方式與我們聯繫。</p>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-mystic-gold/10 flex items-center justify-center text-mystic-gold shrink-0">
                            <Car size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">自行開車</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                導航設定「{siteSettings.templeName}」或「{siteSettings.address}」即可抵達。
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-mystic-gold/10 flex items-center justify-center text-mystic-gold shrink-0">
                            <Bus size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">捷運/公車</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                捷運輔大站下車，步行或轉乘公車至福營路附近。
                            </p>
                        </div>
                    </div>

                    {/* Official Line Account */}
                    <div className="flex gap-4 p-4 border border-green-900/50 bg-green-900/10 rounded-sm">
                        <div className="w-12 h-12 bg-green-500 flex items-center justify-center text-white shrink-0 rounded-full">
                            <MessageCircle size={24} fill="white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">官方 LINE 帳號</h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-3">
                                加入好友，線上預約點燈、詢問科儀事宜、接收最新法會通知。
                            </p>
                            <a 
                                href={siteSettings.lineUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full transition-colors"
                            >
                                <MessageCircle size={14} />
                                立即加入好友
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="w-full lg:w-2/3 h-[500px] bg-gray-800 rounded-sm overflow-hidden border border-white/10 relative group">
                {/* Embedded Google Map with Search Query for new address */}
                <iframe 
                    src={mapSrc}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(100%) contrast(1.2) invert(90%) hue-rotate(180deg)' }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="group-hover:filter-none transition-all duration-500"
                ></iframe>
                
                <div className="absolute bottom-4 left-4 bg-mystic-dark/90 p-4 border border-mystic-gold/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-mystic-gold font-bold">
                        <MapPin size={16} />
                        {siteSettings.templeName}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{siteSettings.address}</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
