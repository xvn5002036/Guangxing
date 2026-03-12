import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Solar, Lunar } from 'lunar-javascript';

interface AlmanacProps {
  onOpenAdmin?: () => void;
}

const Almanac: React.FC<AlmanacProps> = ({ onOpenAdmin }) => {
  const today = new Date();
  const solar = Solar.fromDate(today);
  const lunar = solar.getLunar();
  
  const dateStr = today.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  const lunarDate = `農曆 ${lunar.getMonthInChinese()}月 ${lunar.getDayInChinese()}`;
  const suiCi = `歲次 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`;

  const goodActivities = lunar.getDayYi();
  const badActivities = lunar.getDayJi();

  const daySha = lunar.getDaySha();
  const dayChong = `${lunar.getDayChongDesc()} (沖${lunar.getDayChongShengXiao()})`;
  const luckyHours = lunar.getTimes()
    .filter(t => t.getTianShenLuck() === '吉')
    .map(t => t.getZhi() + '時')
    .join(' ');

  return (
    <section id="almanac" className="relative -mt-20 z-20 container mx-auto px-6 mb-24">
      <div className="bg-mystic-charcoal border-t-4 border-mystic-gold shadow-2xl rounded-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 transform hover:-translate-y-2 transition-transform duration-500">

        {/* Date Display */}
        <div className="flex items-center gap-6 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8 w-full md:w-auto justify-center md:justify-start">
          <div className="text-center bg-white/5 p-4 rounded-lg border border-white/10">
            <span className="block text-4xl font-bold text-mystic-gold font-serif">{today.getDate()}</span>
            <span className="block text-xs text-gray-400 uppercase tracking-widest">{today.toLocaleString('default', { month: 'short' })}</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white leading-tight">{dateStr}</h3>
            <p className="text-mystic-gold font-medium">{lunarDate}</p>
            <p className="text-gray-500 text-xs">{suiCi}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-white/5">
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded font-bold text-[9px]">煞方位</span>
                <span className="text-gray-300 font-medium">{daySha}</span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="bg-orange-900/30 text-orange-400 px-1.5 py-0.5 rounded font-bold text-[9px]">每日沖煞</span>
                <span className="text-gray-300 font-medium">{dayChong}</span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded font-bold text-[9px]">每日吉時</span>
                <span className="text-gray-300 font-medium">{luckyHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yi / Ji */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <div className="bg-green-900/10 border border-green-900/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-800 text-green-100 text-xs px-2 py-1 rounded font-bold">宜</div>
              <CheckCircle2 className="w-4 h-4 text-green-700" />
            </div>
            <div className="flex flex-wrap gap-2">
              {goodActivities.map(act => (
                <span key={act} className="text-sm text-gray-300">{act}</span>
              ))}
            </div>
          </div>
          <div className="bg-red-900/10 border border-red-900/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-900 text-red-100 text-xs px-2 py-1 rounded font-bold">忌</div>
              <XCircle className="w-4 h-4 text-red-800" />
            </div>
            <div className="flex flex-wrap gap-2">
              {badActivities.map(act => (
                <span key={act} className="text-sm text-gray-300">{act}</span>
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default Almanac;