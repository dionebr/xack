
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Recovery from './pages/Recovery';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import Cheats from './pages/Cheats';
import Events from './pages/Events';
import About from './pages/About';
import Learning from './pages/Learning';
import MachineWalkthrough from './pages/MachineWalkthrough';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminReports from './pages/Admin/Reports';
import AdminUsers from './pages/Admin/Users';
import AdminRoute from './components/AdminRoute';
import PublicProfile from './pages/PublicProfile';
import ChatWindow from './components/Social/ChatWindow';
import ChatDock from './components/Social/ChatDock';
import CommunityHub from './pages/Community/CommunityHub';
import CommunityDetail from './pages/Community/CommunityDetail';
import TopicDetail from './pages/Community/TopicDetail';

// Root redirect component
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted text-sm font-bold uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const noLayoutPaths = ['/login', '/recovery'];
  const isReportPage = location.pathname.includes('/report');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = noLayoutPaths.includes(location.pathname);

  if (isAuthPage || isReportPage || isAdminPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/profile/public/:slug" element={<PublicProfile />} />
        <Route path="/machines/:id/report" element={<MachineWalkthrough />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute><AdminReports /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><AdminUsers /></AdminRoute>
        } />
      </Routes>
    );
  }

  return (
    <Layout>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/learning" element={
          <ProtectedRoute><Learning /></ProtectedRoute>
        } />
        <Route path="/machines" element={
          <ProtectedRoute><Machines /></ProtectedRoute>
        } />
        <Route path="/machines/:id" element={
          <ProtectedRoute><MachineDetail /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute><Leaderboard /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute><Friends /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
        <Route path="/cheats" element={
          <ProtectedRoute><Cheats /></ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute><Events /></ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute><About /></ProtectedRoute>
        } />
        {/* Community Routes */}
        <Route path="/communities" element={
          <ProtectedRoute><CommunityHub /></ProtectedRoute>
        } />
        <Route path="/communities/:id" element={
          <ProtectedRoute><CommunityDetail /></ProtectedRoute>
        } />
        <Route path="/communities/:communityId/topic/:topicId" element={
          <ProtectedRoute><TopicDetail /></ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocialProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <ChatWindow />
          <ChatDock />
        </SocialProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
