
import React, { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { NavItem } from '../types';

import { useData } from '../context/DataContext';

const navItems: NavItem[] = [
  { label: '宮廟沿革', href: '#history' },
  { label: '組織架構', href: '#organization' },
  { label: '線上燈牆', href: '#lighting-wall' },
  { label: '行事曆', href: '#calendar' },
  { label: '線上上香', href: '#ritual' },
  // { label: '靈籤擲筊', href: '#oracle' }, // Removed by request
  { label: '濟世服務', href: '#services' },
  { label: '活動花絮', href: '#gallery' },
  { label: '交通指引', href: '#contact-info' },
];

const Header: React.FC = () => {
  const { siteSettings } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll detection for header background styling
  useEffect(() => {
    const handleScroll = () => {
      // Increase threshold to 50 to prevent accidental triggering near top
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open to prevent background scrolling
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    // Small timeout to allow body scroll unlock and menu close animation to start/finish
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  // Dynamic header classes to prevent 'backdrop-filter' from breaking 'fixed' child positioning
  const getHeaderClasses = () => {
    const base = "fixed w-full z-50 transition-all duration-500";

    if (isMenuOpen) {
      // When menu is open, remove backdrop-blur and background to ensure Overlay (fixed child) works correctly relative to viewport
      // Maintain padding to prevent layout shift of the button
      return `${base} bg-transparent border-transparent ${isScrolled ? 'py-3' : 'py-6'}`;
    }

    // Default states
    return isScrolled
      ? `${base} bg-mystic-dark/95 backdrop-blur-md border-b border-mystic-gold/20 py-3 shadow-lg`
      : `${base} bg-transparent py-6 border-transparent shadow-none`;
  };

  return (
    <header className={getHeaderClasses()}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 border rounded-full flex items-center justify-center transition-all duration-500 ${isScrolled ? 'bg-black border-mystic-gold' : 'bg-transparent border-mystic-gold/50'}`}>
              <span className="text-mystic-gold font-calligraphy text-2xl group-hover:text-white mt-1">池</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold tracking-[0.2em] transition-colors duration-300 ${isScrolled ? 'text-gray-100' : 'text-white drop-shadow-md'}`}>{siteSettings.templeName}</span>
            </div>
          </a>

          {/* Desktop Nav - HIDDEN ALWAYS now to use Hamburger Menu everywhere */}
          <nav className="hidden items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-xs transition-all duration-300 tracking-widest relative group font-bold ${isScrolled ? 'text-gray-300 hover:text-mystic-gold' : 'text-white/90 hover:text-white drop-shadow-sm'}`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-mystic-gold group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Menu Button - Visible on ALL screens. Z-70 keeps it above the overlay */}
          <button
            className={`transition-colors relative z-[70] ${isScrolled || isMenuOpen ? 'text-mystic-gold hover:text-white' : 'text-white hover:text-mystic-gold drop-shadow-md'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Full Screen Menu - Visible on ALL screens when open */}
      {isMenuOpen && (
        <div className="fixed inset-0 w-screen h-screen bg-mystic-dark/98 z-[60] flex flex-col justify-center items-center backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col w-full max-w-sm px-6 gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-xl text-gray-200 hover:text-mystic-gold py-4 tracking-[0.3em] transition-colors border-b border-white/5 w-full text-center cursor-pointer"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
