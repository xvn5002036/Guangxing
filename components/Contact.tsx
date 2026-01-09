import React from 'react';
import { MapPin, Bus, Car } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact-info" className="py-24 bg-mystic-dark relative border-t border-mystic-gold/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Info */}
            <div className="w-full lg:w-1/3 space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">交通指引</h2>
                    <p className="text-gray-400 mb-8">歡迎蒞臨新莊武壇廣行宮參香祈福，您可以透過以下方式抵達。</p>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-mystic-gold/10 flex items-center justify-center text-mystic-gold shrink-0">
                            <Car size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold mb-1">自行開車</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                導航設定「新莊武壇廣行宮」或「新北市新莊區福營路500號」即可抵達。
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
                </div>
            </div>

            {/* Map */}
            <div className="w-full lg:w-2/3 h-[400px] bg-gray-800 rounded-sm overflow-hidden border border-white/10 relative group">
                {/* Embedded Google Map with Search Query for new address */}
                <iframe 
                    src="https://maps.google.com/maps?q=242%E6%96%B0%E5%8C%97%E5%B8%82%E6%96%B0%E8%8E%8A%E5%8D%80%E7%A6%8F%E7%87%9F%E8%B7%AF500%E8%99%9F&t=&z=16&ie=UTF8&iwloc=&output=embed" 
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
                        新莊武壇廣行宮
                    </div>
                    <p className="text-xs text-gray-400 mt-1">242新北市新莊區福營路500號</p>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;