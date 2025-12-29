import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useLocalizedPath } from '../utils/navigation';

const LegalFooter: React.FC = () => {
    const { t } = useTranslation();
    const getPath = useLocalizedPath();

    return (
        <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
                <a
                    href={getPath('terms')}
                    className="text-text-muted hover:text-accent-purple transition-colors font-medium"
                >
                    {t('legal.terms.title')}
                </a>
                <span className="text-text-muted">•</span>
                <a
                    href={getPath('guidelines')}
                    className="text-text-muted hover:text-accent-purple transition-colors font-medium"
                >
                    {t('legal.guidelines.title')}
                </a>
                <span className="text-text-muted">•</span>
                <a
                    href="mailto:contact@xack.com"
                    className="text-text-muted hover:text-accent-purple transition-colors font-medium"
                >
                    Contato
                </a>
            </div>
            <div className="text-center mt-4 text-xs text-text-muted">
                © 2025 XACK Platform. Todos os direitos reservados.
            </div>
        </div>
    );
};

export default LegalFooter;
