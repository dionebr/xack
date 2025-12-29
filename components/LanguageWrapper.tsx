import React, { useEffect } from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';

const LanguageWrapper: React.FC = () => {
    const { lang } = useParams<{ lang: string }>();
    const { setLanguage, language: currentContextLang } = useTranslation();

    // Check if URL lang is valid
    const isValidLang = lang === 'pt' || lang === 'en';

    useEffect(() => {
        // Sync URL -> Context ONLY if URL is valid and different
        if (isValidLang && lang !== currentContextLang) {
            setLanguage(lang);
        }
    }, [lang, isValidLang, currentContextLang, setLanguage]);

    // If URL lang is invalid, redirect to context language or default (en)
    // We construct the path manually to be safe.
    // However, we must ensure we don't redirect if we are already essentially "there" but pending param update
    // But useParams should be synchronous in render.

    if (!isValidLang) {
        // Fallback to 'en' if the URL param is completely busted
        return <Navigate to={`/en/dashboard`} replace />;
    }

    return <Outlet />;
};

export default LanguageWrapper;
