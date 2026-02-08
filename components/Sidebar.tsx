
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    { name: t('nav_dashboard'), path: '/', icon: 'dashboard', section: 'Overview' },
    { name: t('nav_machines'), path: '/machines', icon: 'dns', section: 'Labs' },
    { name: t('nav_arena'), path: '/arena', icon: 'swords', section: 'Labs' },
    { name: t('nav_vpn'), path: '/vpn', icon: 'vpn_lock', section: 'Labs' },
    { name: t('nav_scoreboard'), path: '/scoreboard', icon: 'leaderboard', section: 'Competition' },
    { name: t('nav_hall_of_fame'), path: '/hall-of-fame', icon: 'military_tech', section: 'Competition' },
    { name: t('nav_academy'), path: '/learning', icon: 'school', section: 'Learning' },
    { name: t('nav_pro_plans'), path: '/pricing', icon: 'workspace_premium', section: 'Account' },
    { name: t('nav_billing'), path: '/billing', icon: 'receipt_long', section: 'Account' },
    { name: t('nav_admin'), path: '/admin', icon: 'admin_panel_settings', section: 'Control' },
  ];

  const sections = [
    { id: 'Overview', label: t('nav_overview') },
    { id: 'Labs', label: t('nav_labs') },
    { id: 'Competition', label: t('nav_competition') },
    { id: 'Learning', label: t('nav_learning') },
    { id: 'Account', label: t('nav_account') },
    { id: 'Control', label: t('nav_control') }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#0a0d1a] border-r border-slate-200 dark:border-[#1e2438] flex flex-col shrink-0 transition-colors duration-300">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-white text-xl">terminal</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">XACK</h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar pb-8">
        {sections.map(section => (
          <div key={section.id} className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            {menuItems.filter(item => item.section === section.id).map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                >
                  <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-[#1e2438] flex gap-2">
        <Link to="/profile" className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#101424] border border-slate-200 dark:border-[#1e2438] hover:border-indigo-500 transition-all shadow-sm">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
            <img src="https://picsum.photos/seed/user/40/40" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">CyberGhost</p>
            <p className="text-[10px] text-slate-500 font-mono">1,240 XP</p>
          </div>
        </Link>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="p-3 rounded-xl bg-slate-50 dark:bg-[#101424] border border-slate-200 dark:border-[#1e2438] hover:border-red-500 hover:text-red-500 text-slate-400 transition-all shadow-sm flex items-center justify-center"
          title={t('nav_logout') || "Logout"}
        >
          <span className="material-icons-round text-lg">logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
