import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const { faqs } = useData();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold text-white">常見問題</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => (
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