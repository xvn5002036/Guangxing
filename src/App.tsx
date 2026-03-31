
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
              <Almanac onOpenAdmin={() => setIsAdminOpen(true)} />
              <TempleHistory />
              <Organization />
              <DeityInfo />
              <VirtualTour />
              <LightingWall />
              <News />
              <TempleCalendar />
              <Services />
              <section className="py-24 bg-gradient-to-r from-mystic-dark to-mystic-charcoal border-t border-white/5">
                <Container>
                  <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-black/25 backdrop-blur p-8 sm:p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
                    <SectionHeader
                      eyebrow="Support"
                      title="支持宮廟發展"
                      description="您的捐款將幫助我們維護傳統文化、修繕環境，並提供更完善的信眾服務。"
                      className="mb-10"
                    />
                    <button
                      onClick={() => setIsDonationOpen(true)}
                      className="inline-flex items-center justify-center rounded-xl bg-mystic-gold text-black font-semibold px-8 py-3.5 hover:bg-mystic-gold/90 transition-colors shadow-[0_20px_50px_rgba(197,160,89,0.25)] tracking-[0.18em]"
                    >
                      立即捐款
                    </button>
                    <div className="mt-4 text-xs text-white/50 tracking-[0.2em]">
                      安全付款（示範功能）
                    </div>
                  </div>
                </Container>
              </section>
              <Gallery />
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
