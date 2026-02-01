import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import NewsModal from './NewsModal';

const News: React.FC = () => {
  const { news } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort news by date descending and take top 3
  const sortedNews = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const latestNews = sortedNews.slice(0, 3);

  return (
    <section id="news" className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-800 pb-4">
            <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold tracking-widest text-white">宮廟快訊</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-mystic-gold hover:text-white transition-colors mt-4 md:mt-0 flex items-center gap-1 cursor-pointer"
            >
                查看更多 &rarr;
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.length > 0 ? (
              latestNews.map((item, index) => (
                <div key={item.id || index} className="bg-mystic-charcoal p-6 border border-gray-900 hover:border-mystic-gold/30 transition-all group cursor-pointer h-full flex flex-col" onClick={() => setIsModalOpen(true)}>
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            item.category === '法會' ? 'border-red-900 text-red-400' :
                            item.category === '公告' ? 'border-mystic-gold/50 text-mystic-gold' :
                            'border-blue-900 text-blue-400'
                        }`}>
                            {item.category}
                        </span>
                        <span className="text-xs text-gray-500 font-sans">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-200 group-hover:text-mystic-gold transition-colors line-clamp-2 h-14">
                        {item.title}
                    </h3>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-10">目前尚無最新公告</div>
            )}
        </div>
        
        <NewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </section>
  );
};

export default News;