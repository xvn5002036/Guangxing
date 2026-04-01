
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Almanac from './components/Almanac';
import TempleCalendar from './components/TempleCalendar';
import DeityInfo from './components/DeityInfo';
import TempleHistory from './components/TempleHistory';
import Organization from './components/Organization';
import Services from './components/Services';
import LightingWall from './components/LightingWall';
import Gallery from './components/Gallery';
import FAQ from './components/FAQ';
import News from './components/News';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackgroundEffects from './components/BackgroundEffects';
import AdminPanel from './components/AdminPanel';
import MemberCenter from './components/MemberCenter';
import { useData } from './context/DataContext';
import { ScriptureShop } from './components/ScriptureShop';
import MarqueeAnnouncement from './components/MarqueeAnnouncement';
import VirtualTour from './components/VirtualTour';
import DonationModal from './components/DonationModal';
import Container from './components/layout/Container';
import SectionHeader from './components/layout/SectionHeader';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [view, setView] = useState<'HOME' | 'MEMBER' | 'SHOP'>('HOME');
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const { user } = useData();

  return (
    <>
      <div className="min-h-screen flex flex-col bg-mystic-dark relative">
        <BackgroundEffects />

        {isAdminOpen ? (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        ) : view === 'MEMBER' ? (
          <>
            <Header
              onNavigateToMember={() => setView('MEMBER')}
              onNavigateToShop={() => setView('SHOP')}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />
            <MarqueeAnnouncement />
            <MemberCenter onBack={() => setView('HOME')} />
          </>
        ) : view === 'SHOP' ? (
          <>
            <Header
              onNavigateToMember={() => setView('MEMBER')}
              onNavigateToShop={() => setView('SHOP')}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />
            <MarqueeAnnouncement />
            <main className="flex-grow pt-20">
              <ScriptureShop userId={user?.id} />
              <div className="container mx-auto px-6 py-10 text-center">
                <button onClick={() => setView('HOME')} className="text-gray-500 hover:text-mystic-gold transition-all text-sm">
                  ← 返回首頁
                </button>
              </div>
            </main>
            <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
          </>
        ) : (
          <div className="relative z-10">
            <Header
              onNavigateToMember={() => setView('MEMBER')}
              onNavigateToShop={() => setView('SHOP')}
              onOpenAdmin={() => setIsAdminOpen(true)}
            />
            <MarqueeAnnouncement />
            <main className="flex-grow">
              <Hero />
              {/* 1. 即時資訊 — 讓信眾第一眼看到最新消息與活動 */}
              <News />
              <TempleCalendar />
              {/* 2. 核心功能 — 服務與點燈 */}
              <Services />
              <LightingWall />
              {/* 3. 實用工具 */}
              <Almanac onOpenAdmin={() => setIsAdminOpen(true)} />
              {/* 4. 認識廟宇 */}
              <DeityInfo />
              <TempleHistory />
              <Organization />
              {/* 5. 體驗與記憶 */}
              <VirtualTour />
              <Gallery />
              {/* 6. 行動呼籲 (CTA) */}
              <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080808 0%, #0D1117 50%, #080808 100%)' }}>
                {/* 背景裝飾 */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.06),transparent_70%)]" />
                <div className="absolute top-0 left-0 right-0 divider-gold" />
                <div className="absolute bottom-0 left-0 right-0 divider-gold" />
                <Container>
                  <div className="mx-auto max-w-3xl text-center relative z-10">
                    <SectionHeader
                      eyebrow="Support"
                      title="支持宮廟發展"
                      description="您的捐款將幫助我們維護傳統文化、修繕環境，並提供更完善的信眾服務。"
                      className="mb-10"
                    />
                    <button
                      onClick={() => setIsDonationOpen(true)}
                      className="inline-flex items-center justify-center rounded-xl bg-mystic-gold text-black font-semibold px-10 py-4 hover:bg-mystic-shine transition-all duration-300 shadow-[0_20px_60px_rgba(197,160,89,0.30)] tracking-[0.22em] shadow-gold-hover"
                    >
                      立即捐款
                    </button>
                    <div className="mt-5 text-xs text-white/40 tracking-[0.22em]">
                      安全付款（示範功能）
                    </div>
                  </div>
                </Container>
              </section>
              {/* 7. 問題解答與聯絡 */}
              <FAQ />
              <Contact />
            </main>
            <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
          </div>
        )}
      </div>
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </>
  );
};

export default App;
