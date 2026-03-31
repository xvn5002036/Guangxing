
import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import { User, LogIn, Menu, X, Lock } from 'lucide-react';
import { NavItem } from '../types';
import { useData } from '../context/DataContext';

const navItems: NavItem[] = [
  { label: '宮廟沿革', href: '#history' },
  { label: '組織架構', href: '#organization' },
  { label: '線上燈牆', href: '#lighting-wall' },
  { label: '行事曆', href: '#calendar' },
  // { label: '靈籤擲筊', href: '#oracle' }, // Removed by request
  // { label: '線上上香', href: '#ritual' }, // Removed by request
  { label: '濟世服務', href: '#services' },
  { label: '活動花絮', href: '#gallery' },
  { label: '數位商城', href: '#shop' },
  { label: '交通指引', href: '#contact-info' },
];

interface HeaderProps {
  onNavigateToMember: () => void;
  onNavigateToShop: () => void;
  onOpenAdmin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateToMember, onNavigateToShop, onOpenAdmin }) => {
  const { siteSettings, user } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  // Lock body scroll when AUTH modal is open
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isMenuOpen) {
      // Only unset if menu is also not open
      document.body.style.overflow = 'unset';
    }
  }, [isAuthOpen, isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href === '#shop') {
      onNavigateToShop();
      return;
    }

    // Small timeout
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
      ? `${base} bg-mystic-dark/70 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)]`
      : `${base} bg-transparent py-5 border-transparent shadow-none`;
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group">
              <div
                className={`w-10 h-10 border rounded-full flex items-center justify-center transition-all duration-500 ${
                  isScrolled ? 'bg-black/60 border-white/10' : 'bg-black/20 border-white/10'
                }`}
              >
                <span className="text-mystic-gold font-calligraphy text-2xl group-hover:text-white mt-1">池</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[15px] sm:text-base font-semibold tracking-[0.18em] transition-colors duration-300 ${
                    isScrolled ? 'text-gray-100' : 'text-white drop-shadow-md'
                  }`}
                >
                  {siteSettings.templeName}
                </span>
                <span className="hidden sm:block text-xs tracking-[0.35em] text-white/50">
                  TRADITION · FAITH · CULTURE
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-3 py-2 rounded-full text-xs tracking-[0.25em] transition-all duration-200 ${
                    isScrolled
                      ? 'text-gray-200 hover:text-white hover:bg-white/5'
                      : 'text-white/80 hover:text-white hover:bg-white/5 drop-shadow-sm'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Auth Button */}
              <button
                onClick={() => {
                  if (user) {
                    onNavigateToMember();
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className={`relative z-[70] flex items-center gap-2 text-xs tracking-[0.25em] font-semibold py-2.5 px-4 border rounded-full transition-all duration-200 ${
                  isScrolled || isMenuOpen
                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    : 'border-white/10 bg-black/20 text-white hover:bg-white/10'
                }`}
              >
                {user ? (
                  <>
                    <User size={14} />
                    <span className="hidden md:inline">會員中心</span>
                  </>
                ) : (
                  <>
                    <LogIn size={14} />
                    <span className="hidden md:inline">登入</span>
                  </>
                )}
              </button>

              {/* Admin Button */}
              <button
                // @ts-ignore
                onClick={onOpenAdmin}
                className={`hidden md:flex items-center gap-2 text-xs tracking-[0.25em] font-semibold py-2.5 px-4 border rounded-full transition-all duration-200 ${
                  isScrolled || isMenuOpen
                    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                    : 'border-white/10 bg-black/20 text-white hover:bg-white/10'
                }`}
                title="管理員登入"
              >
                <Lock size={14} />
              </button>

              {/* Menu Button - Visible on mobile/tablet. Z-70 keeps it above overlay */}
              <button
                className={`lg:hidden transition-colors relative z-[70] rounded-full border border-white/10 bg-black/20 p-2.5 ${
                  isScrolled || isMenuOpen ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10 drop-shadow-md'
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? '關閉選單' : '開啟選單'}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Menu - Visible on ALL screens when open */}
        {isMenuOpen && (
          <div className="fixed inset-0 w-screen h-screen bg-mystic-dark/80 z-[60] flex flex-col items-center backdrop-blur-2xl animate-fade-in overflow-y-auto pb-16 pt-24">
            <div className="w-full max-w-md px-6">
              <div className="rounded-2xl border border-white/10 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-[clamp(1rem,4.5vw,1.35rem)] text-gray-100 hover:bg-white/5 py-4 tracking-[0.25em] transition-colors border-b border-white/10 w-full text-center cursor-pointer font-medium"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Auth Button Clone in Menu */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (user) {
                    onNavigateToMember();
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className="m-4 text-center text-black bg-mystic-gold py-3.5 rounded-xl tracking-[0.25em] font-semibold hover:bg-mystic-gold/90 transition-colors"
              >
                {user ? '會員中心' : '會員登入 / 註冊'}
              </button>

              {/* Mobile Admin Button */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="mb-2 text-center text-white/60 text-sm tracking-[0.25em] hover:text-white transition-colors pb-4 w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock size={14} />
                  <span>管理員後台</span>
                </div>
              </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Header;
