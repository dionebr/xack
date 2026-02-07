
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { Locale } from '../translations';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'EN', name: 'English', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'BR', name: 'Português', flag: 'https://flagcdn.com/w40/br.png' },
  { code: 'ES', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
];

const Header: React.FC<HeaderProps> = ({ onToggleTheme, isDarkMode }) => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(p => p);
  const { locale, setLocale } = useTranslation();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center px-8 py-6 shrink-0 relative z-40 transition-all duration-300">
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
          <span className="material-icons-round text-lg">folder</span>
          <span className="capitalize">{pathParts[0] || 'Dashboard'}</span>
          {pathParts.length > 1 && (
            <>
              <span className="material-icons-round text-xs">chevron_right</span>
              <span className="text-slate-900 dark:text-slate-300 font-semibold capitalize">
                {pathParts[1]}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-[#101424] border border-slate-200 dark:border-[#1e2438] hover:border-primary transition-all shadow-sm hover:shadow-md group"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                <img src={currentLang.flag} alt={currentLang.code} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{currentLang.code}</span>
              <span className={`material-icons-round text-sm text-slate-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#101424] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                <style>{`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                `}</style>
                <div className="p-2 space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        locale === lang.code 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                          <img src={lang.flag} alt={lang.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold">{lang.name}</span>
                      </div>
                      {locale === lang.code && (
                        <span className="material-icons-round text-sm">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsNotifOpen(true)}
            className="p-2.5 rounded-xl bg-white dark:bg-[#101424] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#1e2438] hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm relative group"
          >
            <span className="material-icons-round text-xl group-hover:scale-110 transition-transform">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,1)]"></span>
          </button>

          <button 
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-[#101424] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#1e2438] hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm group"
          >
            <span className="material-icons-round text-xl group-hover:rotate-12 transition-transform">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      <NotificationCenter 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
      />
    </>
  );
};

export default Header;
