
import React from 'react';
import { MapPin, Phone, Clock, AlertCircle, Lock, MessageCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

interface FooterProps {
  onOpenAdmin?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { siteSettings } = useData();

  return (
    <footer id="contact" className="bg-black text-gray-500 py-16 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 items-start">

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white tracking-widest">{siteSettings.templeName}</h3>
            <p className="text-sm max-w-xs">承襲千年信仰，融合現代科技。在雲端，延續人與神之間的對話。</p>

            <div className="pt-2">
              <a href={siteSettings.lineUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-500 rounded border border-green-900/50 hover:bg-green-800 hover:text-white transition-colors">
                <MessageCircle size={16} />
                <span className="text-xs font-bold">加入官方 LINE</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-mystic-gold" />
              <span>{siteSettings.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-mystic-gold" />
              <span>{siteSettings.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-mystic-gold" />
              <span>每日 05:00 - 21:00</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-600 mb-4">
              &copy; {new Date().getFullYear()} {siteSettings.templeName}.<br />
              All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
