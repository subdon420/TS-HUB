import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Search, 
  Database, 
  LogOut, 
  ShieldCheck, 
  Code2, 
  Layers, 
  Activity,
  GitPullRequest,
  Bug,
  Play,
  Building,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ 
  onOpenCommandPalette, 
  onOpenCompassInfo, 
  onOpenWebhookSim,
}) => {
  const navigate = useNavigate();
  const { user, role, switchRole, logout } = useAuth();

  const isDev = role === 'developer';
  const isQA = role === 'tester';

  const navItems = [
    { name: 'Projects', to: '/projects', icon: Layers },
    { name: 'Bug Hub', to: '/bugs', icon: Bug },
    { name: 'Test Suites', to: '/test-suites', icon: Layers },
    { name: 'Test Runs', to: '/test-runs', icon: Play },
    { name: 'Live Feed', to: '/activity', icon: Activity },
    { name: 'Git Sync', to: '/integrations', icon: GitPullRequest },
    { name: 'Workspace', to: '/workspace', icon: Building },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/60 bg-[#080C16]/95 backdrop-blur-2xl">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0" 
          onClick={() => navigate('/projects')}
        >
          <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
            isDev 
              ? 'bg-purple-950/70 border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.35)] text-purple-300' 
              : 'bg-cyan-950/70 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35)] text-cyan-300'
          }`}>
            <Terminal size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-slate-100 font-sans">
                Tester's<span className={isDev ? 'text-purple-400' : 'text-cyan-400'}>Home</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
              QA ⇄ Dev Collaboration
            </div>
          </div>
        </div>

        {/* Command Palette search trigger */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-2">
          <button
            onClick={() => onOpenCommandPalette(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600 text-xs text-slate-300 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Search tickets, tests, actions...</span>
            </div>
            <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-medium bg-slate-800 rounded border border-slate-700 text-slate-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Action Controls & Role Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* MongoDB Compass Connection Status Pill */}
          <button
            onClick={onOpenCompassInfo}
            title="Inspect MongoDB Compass database connection"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-200 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <Database size={13} className="text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">Compass</span>
          </button>

          {/* Interactive Role Switcher Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-slate-700/80 bg-slate-950/80 shadow-inner">
            <button
              onClick={() => switchRole('tester')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isQA
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck size={13} />
              <span>QA</span>
            </button>
            <button
              onClick={() => switchRole('developer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isDev
                  ? 'bg-purple-950 text-purple-200 border border-purple-400/60 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 size={13} />
              <span>DEV</span>
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-800 object-cover shadow-sm"
              />
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation Sub-Bar */}
      <div className="border-t border-slate-800/70 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                  ${isActive 
                    ? (isDev
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                        : 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]')
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }
                `}
              >
                <Icon size={13} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
};
