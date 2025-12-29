import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import LegalFooter from '../components/LegalFooter';

const TermsOfUse: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-bg-main text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-accent-purple mb-2">
                        {t('legal.terms.title')}
                    </h1>
                    <p className="text-text-muted text-sm">
                        {t('legal.terms.subtitle')}
                    </p>
                </div>

                <div className="space-y-8 bg-bg-card border border-white/10 rounded-2xl p-8">
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">1.</span>
                            {t('legal.terms.section1.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section1.p1')}</p>
                            <p>{t('legal.terms.section1.p2')}</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">2.</span>
                            {t('legal.terms.section2.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section2.p1')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>{t('legal.terms.section2.list.item1')}</li>
                                <li>{t('legal.terms.section2.list.item2')}</li>
                                <li>{t('legal.terms.section2.list.item3')}</li>
                                <li>{t('legal.terms.section2.list.item4')}</li>
                                <li>{t('legal.terms.section2.list.item5')}</li>
                                <li>{t('legal.terms.section2.list.item6')}</li>
                            </ul>
                            <p className="mt-2">{t('legal.terms.section2.p2')}</p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">3.</span>
                            {t('legal.terms.section3.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section3.p1')}</p>
                            <p className="font-bold text-white">{t('legal.terms.section3.p2')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>{t('legal.terms.section3.list.item1')}</li>
                                <li>{t('legal.terms.section3.list.item2')}</li>
                                <li>{t('legal.terms.section3.list.item3')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">4.</span>
                            {t('legal.terms.section4.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section4.p1')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>{t('legal.terms.section4.list.item1')}</li>
                                <li>{t('legal.terms.section4.list.item2')}</li>
                                <li>{t('legal.terms.section4.list.item3')}</li>
                                <li>{t('legal.terms.section4.list.item4')}</li>
                                <li>{t('legal.terms.section4.list.item5')}</li>
                                <li>{t('legal.terms.section4.list.item6')}</li>
                                <li>{t('legal.terms.section4.list.item7')}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">5.</span>
                            {t('legal.terms.section5.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section5.p1')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>{t('legal.terms.section5.list.item1')}</li>
                                <li>{t('legal.terms.section5.list.item2')}</li>
                                <li>{t('legal.terms.section5.list.item3')}</li>
                                <li>{t('legal.terms.section5.list.item4')}</li>
                            </ul>
                            <p className="mt-2">{t('legal.terms.section5.p2')}</p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">6.</span>
                            {t('legal.terms.section6.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section6.p1')}</p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li>{t('legal.terms.section6.list.item1')}</li>
                                <li>{t('legal.terms.section6.list.item2')}</li>
                                <li>{t('legal.terms.section6.list.item3')}</li>
                            </ul>
                            <p className="mt-2">{t('legal.terms.section6.p2')}</p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">7.</span>
                            {t('legal.terms.section7.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section7.p1')}</p>
                            <p>{t('legal.terms.section7.p2')}</p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-accent-purple">8.</span>
                            {t('legal.terms.section8.title')}
                        </h2>
                        <div className="text-text-muted space-y-2 leading-relaxed">
                            <p>{t('legal.terms.section8.p1')}</p>
                        </div>
                    </section>
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

export default TermsOfUse;
