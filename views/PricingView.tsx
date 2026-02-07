
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const PricingView: React.FC = () => {
  const { t } = useTranslation();
  const plans = [
    {
      name: 'OPERATIVE',
      price: 'Free',
      description: 'The starting point for every ghost in the machine.',
      features: ['Access to 50+ Easy Machines', 'Public VPN Access', 'Community Forum Access', 'Standard XP Rewards'],
      buttonText: t('price_current'),
      buttonClass: 'bg-slate-800 text-slate-400 cursor-default',
      icon: 'person_outline'
    },
    {
      name: 'VANGUARD',
      price: '$14.99',
      period: '/mo',
      description: 'Elite access for dedicated researchers and hunters.',
      features: ['All Operative Features', 'Exclusive Weekly Machines', 'Dedicated VPN Nodes', 'Priority Support', 'Early Access to New Labs'],
      buttonText: t('price_upgrade'),
      buttonClass: 'bg-primary hover:bg-indigo-600 text-white shadow-lg shadow-primary/20',
      popular: true,
      icon: 'workspace_premium'
    },
    {
      name: 'NIGHTFALL',
      price: '$29.99',
      period: '/mo',
      description: 'Maximum privilege for teams and professional operatives.',
      features: ['All Vanguard Features', 'Private Lab Hosting (2 Units)', 'Advanced Forensics Tracks', 'Custom Lab Configs', 'Direct API Access'],
      buttonText: 'Go Ultimate',
      buttonClass: 'bg-accent hover:bg-teal-600 text-slate-950 shadow-lg shadow-accent/20',
      icon: 'nightlight_round'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8 pb-20">
      <div className="text-center space-y-4">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] border border-primary/20">{t('price_matrix')}</span>
        <h2 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-tight">{t('price_title')}</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">{t('price_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`relative glass rounded-[2.5rem] p-10 border border-white/5 flex flex-col transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-primary bg-primary/5 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'shadow-2xl'}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl">{t('price_most_recruited')}</div>
            )}
            
            <div className="mb-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${plan.popular ? 'bg-primary/20 text-primary' : 'bg-slate-900 text-slate-500'}`}>
                <span className="material-icons-round text-3xl">{plan.icon}</span>
              </div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">{plan.period}</span>}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-4 leading-relaxed">{plan.description}</p>
            </div>

            <div className="space-y-5 flex-1 mb-10">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 text-xs font-semibold text-slate-300">
                  <span className={`material-icons-round text-lg ${plan.popular ? 'text-primary' : 'text-accent'}`}>check_circle</span>
                  {feature}
                </div>
              ))}
            </div>

            <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all ${plan.buttonClass}`}>
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <section className="glass rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
          <span className="material-symbols-outlined text-[180px] text-primary">groups</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h3 className="text-3xl font-display font-black text-white tracking-tight">{t('price_enterprise')}</h3>
            <p className="text-slate-500 text-lg leading-relaxed">{t('price_enterprise_desc')}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <button className="px-8 py-4 bg-white/5 border border-white/10 hover:border-primary transition-all text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">{t('price_contact')}</button>
              <button className="px-8 py-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest rounded-2xl">Download Specs</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingView;
