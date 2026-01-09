import React, { useState } from 'react';
import { FAQItem } from '../types';
import { Plus, Minus } from 'lucide-react';

const faqData: FAQItem[] = [
  { question: '請問參拜的順序為何？', answer: '請先至天公爐參拜玉皇上帝，再入正殿參拜主神池府王爺，隨後參拜龍邊（左側）陪祀神明，最後參拜虎邊（右側）陪祀神明。' },
  { question: '如何辦理點燈服務？', answer: '您可以使用本網站的「線上服務」進行登記與繳費，或親臨本宮服務台辦理。每盞燈位均有神明庇佑，名額有限。' },
  { question: '擲筊求籤有什麼禁忌嗎？', answer: '請示前請先洗手淨心，清楚稟報姓名、生辰、住址與所求之事。一事一籤，切勿一事多求。若遇笑筊或陰筊，請重新誠心稟報。' },
  { question: '還願的方式有哪些？', answer: '依據您當時許願的內容為主。一般可準備鮮花素果、添香油錢、或協助宮廟事務志工。' },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">常見問題</h2>
        </div>

        <div className="space-y-4">
            {faqData.map((item, index) => (
                <div key={index} className="border border-white/10 rounded-sm overflow-hidden bg-mystic-charcoal/50">
                    <button 
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <span className="text-lg font-bold text-gray-200">{item.question}</span>
                        {openIndex === index ? <Minus className="text-mystic-gold" /> : <Plus className="text-gray-500" />}
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 p-6 pt-0' : 'max-h-0'}`}>
                        <p className="text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {item.answer}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;