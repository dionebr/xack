import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageSwitcher: React.FC = () => {
    const { language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Close dropdown when language changes
    useEffect(() => {
        setIsOpen(false);
    }, [language]);

    const switchLanguage = (newLang: 'en' | 'pt') => {
        if (language === newLang) return;

        // Current path e.g. "/en/friends"
        const currentPath = location.pathname;

        // Remove existing language prefix if present, then add new one
        // Note: HashRouter puts the path in pathname nicely usually
        // If currentPath starts with /en or /pt, replace it.
        const pathWithoutLang = currentPath.replace(/^\/(en|pt)/, '');
        const newPath = `/${newLang}${pathWithoutLang || '/dashboard'}`; // Default to dashboard if root

        console.log('🗺️ Switching language navigation:', { from: currentPath, to: newPath });
        navigate(newPath);
    };

    return (
        <div className="relative z-50">
            {/* Main Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-lg transition-all group shadow-sm"
                title="Change Language"
            >
                <div className="flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-xl">translate</span>
                </div>

                <img
                    src={language === 'en'
                        ? "https://flagcdn.com/w40/us.png"
                        : "https://flagcdn.com/w40/br.png"
                    }
                    alt={language === 'en' ? "US Flag" : "Brazil Flag"}
                    className="w-5 h-3.5 object-cover rounded-[2px]"
                />

                <span className="material-symbols-outlined text-sm text-white/40 group-hover:text-white/80 transition-colors">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-[#1a1b1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden transform origin-top transition-all">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Select Language</div>

                    <button
                        type="button"
                        onClick={() => switchLanguage('en')}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${language === 'en' ? 'bg-white/5 border-l-2 border-accent-purple' : 'border-l-2 border-transparent'
                            }`}
                    >
                        <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                        <span className={`text-sm ${language === 'en' ? 'text-white font-medium' : 'text-white/70'}`}>English</span>
                        {language === 'en' && <span className="material-symbols-outlined text-accent-purple text-sm ml-auto">check</span>}
                    </button>

                    <button
                        type="button"
                        onClick={() => switchLanguage('pt')}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors ${language === 'pt' ? 'bg-white/5 border-l-2 border-accent-purple' : 'border-l-2 border-transparent'
                            }`}
                    >
                        <img src="https://flagcdn.com/w40/br.png" alt="BR" className="w-6 h-4 object-cover rounded-[2px] shadow-sm" />
                        <span className={`text-sm ${language === 'pt' ? 'text-white font-medium' : 'text-white/70'}`}>Brazil</span>
                        {language === 'pt' && <span className="material-symbols-outlined text-accent-purple text-sm ml-auto">check</span>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
