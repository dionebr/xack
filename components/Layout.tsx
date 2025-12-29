
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ASSETS } from '../constants';
import VpnStatusModal from './VpnStatusModal';
import VpnStatusIndicator from './VpnStatusIndicator';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';
import MessagesDropdown from './MessagesDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useLocalizedPath } from '../utils/navigation';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [vpnConnected, setVpnConnected] = useState(true);
  const [language, setLanguage] = useState<'US' | 'BR'>('US');
  const [ghostMode, setGhostMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  // const [notifications, setNotifications] = useState<any[]>([]); // Removed unused state

  // Removed loadNotifications calls as they are handled by useNotifications hook

  const getPath = useLocalizedPath();

  const menuItems = [
    { label: 'DASHBOARD', path: 'dashboard', icon: 'dashboard' },
    { label: 'LEARNING', path: 'learning', icon: 'auto_stories' },
    { label: 'CHEATS', path: 'cheats', icon: 'description' },
    { label: 'MACHINES', path: 'machines', icon: 'dns' },
    { label: 'FRIENDS', path: 'friends', icon: 'groups' },
    { label: 'EVENTS & NEWS', path: 'events', icon: 'event' },
    { label: 'ABOUT', path: 'about', icon: 'person' },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'ADMIN', path: 'admin', icon: 'admin_panel_settings' });
  }

  useEffect(() => {
    const current = menuItems.find(item =>
      item.path === location.pathname ||
      (location.pathname === '/admin' && item.path === '/admin') || // Add explicit check if needed, but simple find works
      (location.pathname.startsWith('/machines/') && item.path === '/machines') ||
      (location.pathname.startsWith('/cheats') && item.path === '/cheats')
    );
    if (current) setActiveTab(current.label);
    else setActiveTab(location.pathname.startsWith('/admin') ? 'ADMIN' : '');
  }, [location.pathname, isAdmin]); // Add isAdmin dependency so active tab updates when menu appears

  const activeIndex = menuItems.findIndex(i => i.label === activeTab);
  const notchTop = activeIndex !== -1 ? 120 + (activeIndex * 80) : -200;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Use centralized notification hook
  const { notifications, unreadCount, loading: notificationsLoading, markAllAsRead, refresh: refreshNotifications } = useNotifications(user?.id || null);

  useEffect(() => {
    // If user opens notifications, we mark as read (this logic will be in the Dropdown component, 
    // but the hook also exposes markAllAsRead which we can pass down)
    if (notificationsOpen) {
      markAllAsRead();
    }
  }, [notificationsOpen, markAllAsRead]);

  // Sync pendingRequests state with the hook's unreadCount
  useEffect(() => {
    setPendingRequests(unreadCount);
  }, [unreadCount]);

  return (
    <>
      <div className="h-screen flex overflow-hidden bg-bg-main print:h-auto print:overflow-visible">
        {/* Sidebar - Highest Z-Index to avoid Header overlap */}
        <aside className={`h-full flex-shrink-0 relative z-[100] py-6 pl-6 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-[100px]' : 'w-[280px]'} print:hidden`}>
          <div className="bg-bg-card h-full w-full rounded-3xl flex flex-col relative shadow-card border border-[#2a2a2c]/30 overflow-visible">
            {activeIndex !== -1 && (
              <div className="absolute right-0 top-0 w-full h-full pointer-events-none">
                <div className="sidebar-notch-top-curve" style={{ top: `${notchTop - 20}px` }} />
                <div className="sidebar-notch-container" style={{ top: `${notchTop}px` }}>
                  <div className="active-indicator-dot"></div>
                </div>
                <div className="sidebar-notch-bottom-curve" style={{ top: `${notchTop + 80}px` }} />
              </div>
            )}

            <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-10 w-6 h-6 bg-accent-purple rounded-full flex items-center justify-center text-white shadow-glow z-[110] transition-transform hover:scale-110">
              <span className="material-symbols-outlined text-sm font-bold">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>

            <div className="py-12 flex flex-col items-center justify-center flex-1 space-y-4">
              {menuItems.map((item) => (
                <Link key={item.label} to={getPath(item.path)} className={`w-full flex items-center gap-4 transition-all tracking-wide uppercase py-4 group relative ${isCollapsed ? 'px-0 justify-center' : 'px-8'} ${activeTab === item.label ? 'text-white font-bold italic neon-text' : 'text-text-muted hover:text-white'}`}>
                  <span className={`material-symbols-outlined text-2xl transition-all ${activeTab === item.label ? 'text-accent-purple' : 'group-hover:text-accent-purple opacity-60'}`}>{item.icon}</span>
                  {!isCollapsed && <span className={`font-display transition-all duration-300 whitespace-nowrap ${activeTab === item.label ? 'text-lg' : 'text-sm'}`}>{item.label}</span>}
                </Link>
              ))}
            </div>

            <div className={`mt-auto ${isCollapsed ? 'p-4' : 'p-8'}`}>
              <button onClick={handleLogout} className={`w-full py-3.5 rounded-2xl border border-[#333] text-text-muted hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium tracking-wide flex items-center justify-center gap-3 group overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}>
                <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform shrink-0 w-6 h-6 flex items-center justify-center">logout</span>
                {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative print:h-auto print:overflow-visible">
          {/* Fixed Header - Lower Z-Index and margin left adjustment */}
          <header className="h-24 flex items-center justify-between px-10 z-[50] shrink-0 bg-bg-main print:hidden">
            <div className="flex items-center gap-2 min-w-[120px] ml-6">
              <Link to="/" className="flex items-center gap-2">
                <img src={ASSETS.LOGO} alt="X-ACK" className="h-12 w-auto transition-transform hover:scale-105" />
              </Link>
            </div>

            <div className="flex-1 max-w-2xl px-12">
              <div className="relative group">
                <input
                  type="text"
                  placeholder='exec search --target "news"'
                  className="w-full bg-[#1a1b1c] border border-white/5 rounded-full py-2.5 px-6 text-sm text-white/40 focus:outline-none focus:border-white/10 focus:bg-[#202123] transition-all placeholder:text-white/10"
                />
                <span className="material-symbols-outlined absolute right-5 top-2.5 text-white/20 text-xl group-hover:text-white/40 transition-colors">search</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <LanguageSwitcher />

              <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-colors cursor-help group/coins" title="Your X-Coins Balance">
                <span className="material-symbols-outlined text-base text-yellow-500 group-hover/coins:animate-spin-slow">monetization_on</span>
                <span className="text-xs font-black text-white font-mono tracking-wider">{profile?.coins || 0}</span>
              </div>

              <div className="w-px h-6 bg-white/5"></div>

              <div className="flex items-center gap-5">
                <VpnStatusIndicator
                  connected={vpnConnected}
                  ip={user?.id ? '10.13.37.x' : null}
                  onClick={() => setModalOpen(true)}
                />

                <div className="relative">
                  <button
                    onClick={() => setMessagesOpen(!messagesOpen)}
                    className="relative text-white/30 hover:text-white transition-colors group"
                  >
                    <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-purple rounded-full shadow-[0_0_8px_#b946e9] animate-pulse"></span>
                  </button>

                  <MessagesDropdown
                    isOpen={messagesOpen}
                    onClose={() => setMessagesOpen(false)}
                    userId={user?.id || null}
                  />
                </div>

                <Link to="/cheats" className="text-white/30 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">help</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative text-white/30 hover:text-white transition-colors group"
                  >
                    <span className="material-symbols-outlined text-2xl">notifications</span>
                    {pendingRequests > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                        {pendingRequests > 9 ? '9+' : pendingRequests}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    userId={user?.id || null}
                    notifications={notifications}
                    loading={notificationsLoading}
                    markAllAsRead={markAllAsRead}
                    refresh={refreshNotifications}
                  />
                </div>
              </div>

              <Link to={user?.id ? `/profile/${user.id}` : '/login'} className="ml-2 group">
                {user?.id ? (
                  <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white/10 p-0.5 group-hover:border-accent-purple transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center text-sm font-black text-white uppercase">
                      {user?.email ? user.email.charAt(0) : <span className="material-symbols-outlined text-lg">person</span>}
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white/10 p-0.5 group-hover:border-accent-purple transition-all duration-300">
                    <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${ASSETS.creatorPhoto})` }} />
                  </div>
                )}
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-10 pb-10 scroll-smooth bg-grid-dots print:h-auto print:overflow-visible print:p-0">
            {children}
          </main>
        </div>
      </div>

      <VpnStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isConnected={vpnConnected}
        vpnIp={user?.id ? '10.8.0.x' : null}
        userId={user?.id || null}
      />
    </>
  );
};

export default Layout;
