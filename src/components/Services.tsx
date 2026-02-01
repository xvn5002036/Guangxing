import React, { useState } from 'react';
import { Sun, Moon, Briefcase, HeartHandshake, Gift, FileText } from 'lucide-react';
import { ServiceItem } from '../types';
import ServiceModal from './ServiceModal';
import { useData } from '../context/DataContext';

const IconMap: Record<string, React.FC<any>> = {
    Sun, Moon, Briefcase, HeartHandshake, Gift, FileText
};

const Services: React.FC = () => {
  const { services } = useData();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section id="services" className="py-24 bg-mystic-charcoal">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
            <span className="text-gray-500 tracking-[0.2em] uppercase text-sm">Online Services</span>
            <h2 className="text-[clamp(1.875rem,5vw,2.5rem)] font-bold text-white mt-2">濟世服務 & 線上點燈</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service) => {
                const Icon = IconMap[service.iconName] || Gift;
                return (
                    <button 
                        key={service.id} 
                        onClick={() => setSelectedService(service)}
                        className="text-left group relative p-8 bg-black/40 border border-white/5 hover:border-mystic-gold/50 transition-all duration-500 overflow-hidden flex flex-col h-full"
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-mystic-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex-grow">
                            <div className="w-12 h-12 bg-mystic-charcoal border border-gray-700 rounded-sm flex items-center justify-center mb-6 group-hover:border-mystic-gold group-hover:text-mystic-gold text-gray-400 transition-colors">
                                <Icon size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-widest">{service.title}</h3>
                            <div className="text-mystic-gold font-serif mb-4 text-sm">
                                {service.type === 'DONATION' ? '隨喜功德' : `緣金 NT$ ${service.price}`}
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                {service.description}
                            </p>
                        </div>
                        <div className="relative z-10 mt-6 pt-4 border-t border-white/5 w-full text-center text-xs text-gray-500 group-hover:text-white uppercase tracking-widest">
                            點擊辦理
                        </div>
                    </button>
                )
            })}
        </div>

        <ServiceModal 
            isOpen={!!selectedService} 
            onClose={() => setSelectedService(null)} 
            service={selectedService} 
        />
      </div>
    </section>
  );
};

export default Services;