import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Almanac from './components/Almanac';
import TempleCalendar from './components/TempleCalendar';
import DeityInfo from './components/DeityInfo';
import TempleHistory from './components/TempleHistory';
import Ritual from './components/Ritual';
import Oracle from './components/Oracle';
import Talisman from './components/Talisman';
import Services from './components/Services';
import Gallery from './components/Gallery';
import FAQ from './components/FAQ';
import News from './components/News';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackgroundEffects from './components/BackgroundEffects';
import AdminPanel from './components/AdminPanel';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-mystic-dark relative">
        <BackgroundEffects />
        
        {isAdminOpen ? (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        ) : (
          <div className="relative z-10">
            <Header />
            <main className="flex-grow">
                <Hero />
                <Almanac onOpenAdmin={() => setIsAdminOpen(true)} />
                <TempleHistory />
                <DeityInfo />
                <News />
                <TempleCalendar />
                <Ritual />
                <Talisman />
                <Oracle />
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