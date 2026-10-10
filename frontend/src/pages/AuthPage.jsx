import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Code2, 
  Terminal, 
  Lock, 
  Mail, 
  User, 
  Building, 
  ArrowRight,
  GitBranch,
  GitPullRequest,
  Globe,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

export const AuthPage = ({ initialMode = 'login', onBackToLanding: propOnBack }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const onBackToLanding = propOnBack || (() => navigate('/'));
  const portalParam = params.role || searchParams.get('portal');
  const defaultRole = portalParam === 'developer' ? 'developer' : 'tester';

  const [mode, setMode] = useState(params.mode || initialMode); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(defaultRole); // 'tester' | 'developer'

  // Form states
  const [email, setEmail] = useState(defaultRole === 'developer' ? 'dev@testers-home.io' : 'tester@testers-home.io');
  const [password, setPassword] = useState(defaultRole === 'developer' ? 'dev123' : 'tester123');
  const [name, setName] = useState('');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [isJoinCode, setIsJoinCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register, quickLogin } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (portalParam && (portalParam === 'developer' || portalParam === 'tester')) {
      handlePortalSwitch(portalParam);
    }
  }, [portalParam]);

  const isTesterPortal = selectedRole === 'tester';

  const handlePortalSwitch = (role) => {
    setSelectedRole(role);
    if (role === 'tester') {
      setEmail('tester@testers-home.io');
      setPassword('tester123');
    } else {
      setEmail('dev@testers-home.io');
      setPassword('dev123');
    }
  };

  const handlePrefill = (role) => {
    if (role === 'tester') {
      setEmail('tester@testers-home.io');
      setPassword('tester123');
      setSelectedRole('tester');
    } else if (role === 'developer') {
      setEmail('dev@testers-home.io');
      setPassword('dev123');
      setSelectedRole('developer');
    } else {
      setEmail('admin@testers-home.io');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password, selectedRole);
      } else {
        await register({
          name,
          email,
          password,
          role: selectedRole,
          workspaceCode: isJoinCode ? workspaceCode : undefined,
          workspaceName: !isJoinCode ? workspaceName : undefined,
        });
      }
      navigate('/projects');
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthDemo = async (provider) => {
    addToast(`${provider} OAuth integration triggered. Logging in as demo persona...`, 'cyber');
    await quickLogin(selectedRole);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-[#080C16] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic ambient glow based on portal */}
      <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isTesterPortal ? 'bg-cyan-500/10 top-1/4 left-1/4' : 'bg-purple-500/10 top-1/4 right-1/4'
      }`} />

      {/* Top back button */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 z-10">
        <button
          onClick={onBackToLanding}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          ← Return to Overview
        </button>
        <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          MongoDB Compass Ready
        </span>
      </div>

      {/* Auth Box Container */}
      <div className={`w-full max-w-md rounded-3xl border backdrop-blur-2xl p-7 sm:p-9 shadow-2xl transition-all duration-500 z-10 ${
        isTesterPortal
          ? 'bg-slate-900/80 border-cyan-500/40 shadow-cyan-950/40'
          : 'bg-slate-900/80 border-purple-500/40 shadow-purple-950/40'
      }`}>
        {/* Brand header */}
        <div className="text-center space-y-1.5 mb-7">
          <div className={`inline-flex p-3 rounded-2xl border transition-colors mb-2 ${
            isTesterPortal ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400' : 'bg-purple-950/80 border-purple-500/50 text-purple-400'
          }`}>
            <Terminal size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tester's Home Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {mode === 'login' ? 'Sign in to access QA test cycles and bug reports' : 'Create an account and calibrate your workspace'}
          </p>
        </div>

        {/* Split Role Switcher Toggle */}
        <div className="p-1 rounded-2xl bg-slate-950/90 border border-slate-700/80 flex items-center mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => handlePortalSwitch('tester')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isTesterPortal
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={16} />
            <span>QA Tester Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('developer')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              !isTesterPortal
                ? 'bg-purple-950 text-purple-200 border border-purple-400/60 shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={16} />
            <span>Developer Portal</span>
          </button>
        </div>

        {/* Dedicated Credentials Info Card */}
        <div className={`p-4 rounded-2xl border mb-5 transition-all ${
          isTesterPortal
            ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-100'
            : 'bg-purple-950/30 border-purple-500/30 text-purple-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className={isTesterPortal ? 'text-cyan-400' : 'text-purple-400'} />
              {isTesterPortal ? 'QA Tester Credentials' : 'Developer Credentials'}
            </span>
            <button
              type="button"
              onClick={() => handlePrefill(selectedRole)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                isTesterPortal
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
                  : 'bg-purple-500/20 border-purple-400/40 text-purple-300 hover:bg-purple-500/30'
              }`}
            >
              Fill Credentials
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px] font-sans font-semibold">EMAIL</span>
              <span className="text-slate-200 font-bold select-all truncate block">
                {isTesterPortal ? 'tester@testers-home.io' : 'dev@testers-home.io'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-sans font-semibold">PASSWORD</span>
              <span className="text-slate-200 font-bold select-all truncate block">
                {isTesterPortal ? 'tester123' : 'dev123'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 leading-tight">
            🛡️ Strict RBAC: {isTesterPortal ? 'QA portal rejects Developer credentials.' : 'Developer portal rejects QA credentials.'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Vane"
                  className="w-full glass-input pl-10 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full glass-input pl-10 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input pl-10 text-sm"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Workspace Setup:</span>
                <button
                  type="button"
                  onClick={() => setIsJoinCode(!isJoinCode)}
                  className="text-cyan-400 underline hover:text-cyan-300 font-semibold"
                >
                  {isJoinCode ? 'Create New Team Hub' : 'Join Existing via Code'}
                </button>
              </div>

              {isJoinCode ? (
                <input
                  type="text"
                  value={workspaceCode}
                  onChange={(e) => setWorkspaceCode(e.target.value)}
                  placeholder="Enter Code (e.g. ALPHA-QA)"
                  className="w-full glass-input uppercase font-mono text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Workspace Name (e.g. Mobile QA Hub)"
                  className="w-full glass-input text-sm"
                />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
              isTesterPortal
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
            }`}
          >
            <span>{loading ? 'Processing...' : (mode === 'login' ? `Sign In to ${selectedRole.toUpperCase()} Portal` : `Create ${selectedRole.toUpperCase()} Account`)}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* OAuth Buttons (Section 4.2) */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <span className="text-xs font-semibold text-slate-400 block mb-3">
            Or authenticate with developer identity
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleOAuthDemo('GitHub')}
              className="py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <GitPullRequest size={15} className="text-cyan-400" />
              <span>GitHub</span>
            </button>
            <button
              onClick={() => handleOAuthDemo('GitLab')}
              className="py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <GitBranch size={15} className="text-purple-400" />
              <span>GitLab</span>
            </button>
            <button
              onClick={() => handleOAuthDemo('Google')}
              className="py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Globe size={15} className="text-emerald-400" />
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Toggle Login vs Register */}
        <div className="mt-6 text-center text-xs sm:text-sm text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-cyan-400 hover:underline font-bold"
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
