
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Almanac from './components/Almanac';
import TempleCalendar from './components/TempleCalendar';
import DeityInfo from './components/DeityInfo';
import TempleHistory from './components/TempleHistory';
import Organization from './components/Organization';
import Ritual from './components/Ritual';
// import Oracle from './components/Oracle';
import Talisman from './components/Talisman';
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
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [view, setView] = useState<'HOME' | 'MEMBER'>('HOME');

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-mystic-dark relative">
        <BackgroundEffects />

        {isAdminOpen ? (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        ) : view === 'MEMBER' ? (
          <>
            <Header onNavigateToMember={() => setView('MEMBER')} />
            <MemberCenter onBack={() => setView('HOME')} />
          </>
        ) : (
          <div className="relative z-10">
            <Header onNavigateToMember={() => setView('MEMBER')} />
            <main className="flex-grow">
              <Hero />
              <Almanac onOpenAdmin={() => setIsAdminOpen(true)} />
              <TempleHistory />
              <Organization />
              <DeityInfo />
              <LightingWall />
              <News />
              <TempleCalendar />
              <Ritual />
              <Talisman />
              <Services />
              <Gallery />
              <FAQ />
              <Contact />
            </main>
            <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
          </div>
        )}
      </div>
    </DataProvider>
  );
};

export default App;
