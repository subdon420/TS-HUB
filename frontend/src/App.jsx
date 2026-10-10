import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { CompassInfoModal } from './components/projects/CompassInfoModal';
import { WebhookSimulatorModal } from './components/collaboration/WebhookSimulatorModal';
import { BugCreateModal } from './components/bugs/BugCreateModal';

// Pages for every single module
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BugsPage } from './pages/BugsPage';
import { BugDetailPage } from './pages/BugDetailPage';
import { TestSuitesPage } from './pages/TestSuitesPage';
import { TestRunsPage } from './pages/TestRunsPage';
import { ActivityPage } from './pages/ActivityPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { api } from './services/api';

// Route protector layout for authenticated modules
const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Global modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCompassOpen, setIsCompassOpen] = useState(false);
  const [isWebhookSimOpen, setIsWebhookSimOpen] = useState(false);
  const [isLogBugOpen, setIsLogBugOpen] = useState(false);

  // Cached items for Ctrl + K
  const [allBugs, setAllBugs] = useState([]);
  const [allCases, setAllCases] = useState([]);

  useEffect(() => {
    if (user) {
      api.getBugs().then(setAllBugs).catch(() => {});
      api.getSuites().then(suites => {
        const cases = [];
        suites.forEach(s => {
          if (s.testCases) cases.push(...s.testCases);
        });
        setAllCases(cases);
      }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center font-mono text-cyan-400">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest">Tester's Home Initializing...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar with module navigation tabs */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCompassInfo={() => setIsCompassOpen(true)}
        onOpenWebhookSim={() => setIsWebhookSimOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {children}
      </main>

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={setIsCommandPaletteOpen}
        bugs={allBugs}
        cases={allCases}
        onSelectBug={(bug) => navigate(`/bugs/${bug._id}`)}
        onSelectCase={(tc) => navigate(`/test-suites?project=${tc.project?._id || tc.project}`)}
        onOpenCreateBug={() => setIsLogBugOpen(true)}
        onOpenCompassInfo={() => setIsCompassOpen(true)}
        onOpenWebhookSim={() => setIsWebhookSimOpen(true)}
      />

      {/* MongoDB Compass Inspection Dialog */}
      <CompassInfoModal
        isOpen={isCompassOpen}
        onClose={() => setIsCompassOpen(false)}
      />

      {/* Git PR Webhook Simulator */}
      <WebhookSimulatorModal
        isOpen={isWebhookSimOpen}
        onClose={() => setIsWebhookSimOpen(false)}
        bugs={allBugs}
        onSyncSuccess={() => {
          api.getBugs().then(setAllBugs).catch(() => {});
        }}
      />

      {/* Quick Global Bug Logger */}
      <BugCreateModal
        isOpen={isLogBugOpen}
        onClose={() => setIsLogBugOpen(false)}
        projectId={allBugs[0]?.project?._id}
        onBugCreated={() => {
          api.getBugs().then(setAllBugs).catch(() => {});
        }}
      />
    </div>
  );
};

// Root index route handler
const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center font-mono text-cyan-400">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest">Tester's Home Initializing...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return <LandingPage />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public & Landing Routes */}
              <Route path="/" element={<RootRoute />} />
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Auth & Portal Routes */}
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/register" element={<AuthPage initialMode="register" />} />
              <Route path="/auth/:role" element={<AuthPage />} />

              {/* Module 1: Projects Management */}
              <Route path="/projects" element={<AppLayout><DashboardPage /></AppLayout>} />
              <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
              <Route path="/projects/:id" element={<AppLayout><ProjectDetailPage /></AppLayout>} />

              {/* Module 2: Bug Tracking System (The Bug Hub) */}
              <Route path="/bugs" element={<AppLayout><BugsPage /></AppLayout>} />
              <Route path="/bugs/:id" element={<AppLayout><BugDetailPage /></AppLayout>} />

              {/* Module 3: Test Case Management System */}
              <Route path="/test-suites" element={<AppLayout><TestSuitesPage /></AppLayout>} />
              <Route path="/tests" element={<Navigate to="/test-suites" replace />} />

              {/* Module 4: Test Run Execution Hub */}
              <Route path="/test-runs" element={<AppLayout><TestRunsPage /></AppLayout>} />
              <Route path="/test-runs/:id" element={<AppLayout><TestRunsPage /></AppLayout>} />

              {/* Module 5: Real-Time Collaboration & Event Stream */}
              <Route path="/activity" element={<AppLayout><ActivityPage /></AppLayout>} />
              <Route path="/collaboration" element={<Navigate to="/activity" replace />} />

              {/* Module 6: Git Webhook & CI/CD Integrations */}
              <Route path="/integrations" element={<AppLayout><IntegrationsPage /></AppLayout>} />
              <Route path="/webhooks" element={<Navigate to="/integrations" replace />} />

              {/* Module 7: Workspace & Team Governance */}
              <Route path="/workspace" element={<AppLayout><WorkspacePage /></AppLayout>} />
              <Route path="/workshop" element={<Navigate to="/workspace" replace />} />
              <Route path="/team" element={<Navigate to="/workspace" replace />} />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
