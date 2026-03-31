import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import NewsModal from './NewsModal';
import Container from './layout/Container';
import SectionHeader from './layout/SectionHeader';

const News: React.FC = () => {
  const { news } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort news by date descending and take top 3
  const sortedNews = [...news].sort((a, b) => b.date.localeCompare(a.date));
  const latestNews = sortedNews.slice(0, 3);

  return (
    <section id="news" className="py-24 bg-black text-white">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <SectionHeader
            align="left"
            eyebrow="Updates"
            title="宮廟快訊"
            description="最新公告、法會資訊與活動消息，第一時間掌握。"
            className="md:max-w-xl"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm tracking-[0.18em] text-white/80 hover:text-white hover:bg-white/5 transition-colors self-start md:self-auto"
          >
            查看更多
            <span aria-hidden>&rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.length > 0 ? (
              latestNews.map((item, index) => (
                <div
                  key={item.id || index}
                  className="rounded-2xl bg-black/25 p-6 border border-white/10 hover:border-mystic-gold/30 hover:bg-white/[0.04] transition-all group cursor-pointer h-full flex flex-col"
                  onClick={() => setIsModalOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            item.category === '法會' ? 'border-red-900 text-red-400' :
                            item.category === '公告' ? 'border-mystic-gold/50 text-mystic-gold' :
                            'border-blue-900 text-blue-400'
                        }`}>
                            {item.category}
                        </span>
                        <span className="text-xs text-white/50 font-sans tracking-[0.12em]">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white/90 group-hover:text-mystic-gold transition-colors line-clamp-2 min-h-[3.5rem] tracking-[0.06em]">
                        {item.title}
                    </h3>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-white/50 py-10">目前尚無最新公告</div>
            )}
        </div>
        
        <NewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Container>
    </section>
  );
};

export default News;