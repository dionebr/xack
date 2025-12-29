import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';

const LanguageRedirect: React.FC = () => {
    const { language } = useTranslation();

    // Detect browser language or use stored preference
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    const defaultLang = language || browserLang;

    return <Navigate to={`/${defaultLang}/dashboard`} replace />;
};

export default LanguageRedirect;
