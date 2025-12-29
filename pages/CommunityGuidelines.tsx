import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import LegalFooter from '../components/LegalFooter';

const CommunityGuidelines: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-bg-main text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-accent-purple mb-2">
                        {t('legal.guidelines.title')}
                    </h1>
                    <p className="text-text-muted text-sm">
                        {t('legal.guidelines.subtitle')}
                    </p>
                </div>

                <div className="space-y-6 bg-bg-card border border-white/10 rounded-2xl p-8">
                    {/* Section 1-6 similar structure */}
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                        <section key={num} className="border-b border-white/5 pb-6 last:border-0">
                            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-accent-purple">{num}.</span>
                                {t(`legal.guidelines.section${num}.title`)}
                            </h2>
                            <div className="text-text-muted space-y-2 leading-relaxed text-sm">
                                <p>{t(`legal.guidelines.section${num}.content`)}</p>
                            </div>
                        </section>
                    ))}

                    <div className="mt-8 p-6 bg-accent-purple/10 border border-accent-purple/30 rounded-xl">
                        <p className="text-white font-bold text-center">
                            {t('legal.guidelines.commitment')}
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
                    >
                        {t('actions.back') || 'Voltar'}
                    </button>
                </div>

                <LegalFooter />
            </div>
        </div>
    );
};

export default CommunityGuidelines;
