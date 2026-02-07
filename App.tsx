
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import MachinesView from './views/MachinesView';
import ScoreboardView from './views/ScoreboardView';
import VPNView from './views/VPNView';
import ProfileView from './views/ProfileView';
import MachineDetailView from './views/MachineDetailView';
import PricingView from './views/PricingView';
import AdminDashboardView from './views/AdminDashboardView';
import BillingView from './views/BillingView';
import LearningView from './views/LearningView';
import ArenaView from './views/ArenaView';
import HallOfFameView from './views/HallOfFameView';
import LoginView from './views/Auth/LoginView';
import SignupView from './views/Auth/SignupView';
import OnboardingFlow from './views/Onboarding/OnboardingFlow';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background-dark overflow-hidden font-sans transition-colors duration-300 nebula-gradient text-slate-900 dark:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/" element={<MainLayout><DashboardView /></MainLayout>} />
          <Route path="/machines" element={<MainLayout><MachinesView /></MainLayout>} />
          <Route path="/machines/:id" element={<MainLayout><MachineDetailView /></MainLayout>} />
          <Route path="/scoreboard" element={<MainLayout><ScoreboardView /></MainLayout>} />
          <Route path="/vpn" element={<MainLayout><VPNView /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfileView /></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><PricingView /></MainLayout>} />
          <Route path="/admin" element={<MainLayout><AdminDashboardView /></MainLayout>} />
          <Route path="/billing" element={<MainLayout><BillingView /></MainLayout>} />
          <Route path="/learning" element={<MainLayout><LearningView /></MainLayout>} />
          <Route path="/arena" element={<MainLayout><ArenaView /></MainLayout>} />
          <Route path="/hall-of-fame" element={<MainLayout><HallOfFameView /></MainLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
