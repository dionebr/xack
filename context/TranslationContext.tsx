import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'pt';

interface TranslationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Start with 'en' as default, but LanguageWrapper will set it from URL
    const [language, setLanguage] = useState<Language>('en');

    // Don't load from localStorage on mount - let LanguageWrapper set it from URL
    // This prevents overriding the URL language

    const changeLanguage = (lang: Language) => {
        // Prevent unnecessary updates if language is already set
        if (language === lang) {
            return;
        }
        console.log('🌐 changeLanguage called:', { currentLanguage: language, newLanguage: lang });
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        return value || key; // Fallback to key if translation not found
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within TranslationProvider');
    }
    return context;
};
