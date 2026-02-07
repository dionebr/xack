
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

const BillingView: React.FC = () => {
  const { t } = useTranslation();
  const transactions = [
    { id: 'INV-4921', date: '2024-03-01', amount: '$14.99', status: 'Paid', plan: 'Vanguard Pro' },
    { id: 'INV-3210', date: '2024-02-01', amount: '$14.99', status: 'Paid', plan: 'Vanguard Pro' },
    { id: 'INV-1843', date: '2024-01-01', amount: '$0.00', status: 'Success', plan: 'Operative (Trial)' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-4xl font-display font-black text-white tracking-tight">{t('bill_title')}</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('bill_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Current Plan</span>
              <h3 className="text-3xl font-display font-black text-white italic tracking-tighter">Vanguard Pro</h3>
              <p className="text-sm font-medium text-slate-500">{t('bill_next_renewal')} <span className="text-white">April 1st, 2024</span>.</p>
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 hover:border-red-500 transition-all text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">{t('bill_cancel')}</button>
          </div>

          <div className="pt-10 border-t border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">{t('bill_history')}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t('bill_invoice')}</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{t('bill_date')}</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Plan</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-6">{t('bill_receipt')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-6">
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">{t.id}</p>
                          <p className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">{t.status}</p>
                        </div>
                      </td>
                      <td className="py-6"><p className="text-xs font-mono text-slate-400">{t.date}</p></td>
                      <td className="py-6 text-center text-xs font-bold text-slate-300">{t.plan}</td>
                      <td className="py-6 text-right pr-6">
                        <button className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 text-slate-500 hover:text-primary hover:border-primary transition-all flex items-center justify-center ml-auto shadow-inner">
                          <span className="material-icons-round text-base">download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl bg-primary/5">
            <h3 className="text-lg font-bold text-white mb-6">{t('bill_payment')}</h3>
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/5 shadow-inner space-y-4">
              <div className="flex justify-between items-start">
                <span className="material-icons-round text-slate-500 text-3xl">credit_card</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">Primary</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-widest">•••• •••• •••• 9921</p>
                <div className="flex justify-between mt-2">
                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Exp: 12/28</p>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 opacity-50" alt="" />
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-4 bg-white/5 border border-white/10 hover:border-primary transition-all text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Update Card</button>
          </section>

          <section className="glass rounded-[2rem] p-8 border border-white/5 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">{t('bill_assistance')}</h3>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">For billing disputes, custom invoicing, or crypto payments, contact our support ghost.</p>
            <button className="w-full py-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-widest rounded-xl">Contact Billing</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
