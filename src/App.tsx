
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

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [view, setView] = useState<'HOME' | 'MEMBER' | 'SHOP'>('HOME');

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
              <LightingWall />
              <News />
              <TempleCalendar />
              <Services />
              <Gallery />
              <FAQ />
              <Contact />
            </main>
            <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
          </div>
        )}
      </div>
    </>
  );
};

export default App;
