import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bug, 
  CheckSquare, 
  Terminal, 
  UserCog, 
  Database, 
  GitPullRequest, 
  ArrowRight,
  Layers,
  Play,
  Activity,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CommandPalette = ({
  isOpen,
  onClose,
  bugs = [],
  cases = [],
  onSelectBug,
  onSelectCase,
  onOpenCreateBug,
  onOpenCompassInfo,
  onOpenWebhookSim,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { role, switchRole } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredBugs = bugs.filter(b => 
    b.key.toLowerCase().includes(query.toLowerCase()) || 
    b.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const filteredCases = cases.filter(c => 
    c.key.toLowerCase().includes(query.toLowerCase()) || 
    c.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 font-sans">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => onClose(false)} />

      {/* Palette box */}
      <div className="relative w-full max-w-2xl bg-[#0c1222] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-700/80 bg-slate-900/60">
          <Search size={20} className="text-cyan-400 mr-3.5" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to ticket (e.g. BUG-101, TC-201)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold text-slate-300 bg-slate-800 rounded-md border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => { onClose(false); onOpenCreateBug(); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-400">
                    <Bug size={15} />
                  </div>
                  <span className="font-semibold">Log New Defect Ticket</span>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onClose(false);
                  switchRole(role === 'developer' ? 'tester' : 'developer');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                    <UserCog size={15} />
                  </div>
                  <span className="font-semibold">Switch Persona (Current: <strong className="text-cyan-300 uppercase">{role}</strong>)</span>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>

              <button
                onClick={() => { onClose(false); onOpenCompassInfo(); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                    <Database size={15} />
                  </div>
                  <span className="font-semibold">Inspect MongoDB Compass Connection</span>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>

              <button
                onClick={() => { onClose(false); onOpenWebhookSim(); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-400">
                    <GitPullRequest size={15} />
                  </div>
                  <span className="font-semibold">Simulate GitHub Webhook PR Merge</span>
                </div>
                <ArrowRight size={14} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Module Navigation */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigate to Module
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => { onClose(false); navigate('/projects'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Layers size={14} className="text-cyan-400" />
                <span>Projects Dashboard</span>
              </button>
              <button
                onClick={() => { onClose(false); navigate('/bugs'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Bug size={14} className="text-rose-400" />
                <span>Defect & Bug Hub</span>
              </button>
              <button
                onClick={() => { onClose(false); navigate('/test-suites'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Layers size={14} className="text-cyan-300" />
                <span>Test Case Repository</span>
              </button>
              <button
                onClick={() => { onClose(false); navigate('/test-runs'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Play size={14} className="text-emerald-400" />
                <span>Test Execution Hub</span>
              </button>
              <button
                onClick={() => { onClose(false); navigate('/activity'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Activity size={14} className="text-indigo-400" />
                <span>Live Event Feed</span>
              </button>
              <button
                onClick={() => { onClose(false); navigate('/workspace'); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
              >
                <Building size={14} className="text-purple-400" />
                <span>Workspace & Team</span>
              </button>
            </div>
          </div>

          {/* Jump to Bugs */}
          {filteredBugs.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Defect Tickets
              </div>
              <div className="space-y-1">
                {filteredBugs.map(bug => (
                  <button
                    key={bug._id}
                    onClick={() => { 
                      onClose(false); 
                      if (onSelectBug) onSelectBug(bug);
                      else navigate(`/bugs/${bug._id}`);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-cyan-300 font-bold shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{bug.key}</span>
                      <span className="truncate font-medium">{bug.title}</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0 font-medium">
                      {bug.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jump to Test Cases */}
          {filteredCases.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Test Cases
              </div>
              <div className="space-y-1">
                {filteredCases.map(tc => (
                  <button
                    key={tc._id}
                    onClick={() => { onClose(false); onSelectCase(tc); }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-emerald-300 font-bold shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{tc.key}</span>
                      <span className="truncate font-medium">{tc.title}</span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 shrink-0 font-medium">
                      {tc.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between font-medium">
          <span>Navigate with mouse or keyboard</span>
          <span>Tester’s Home Cyber Command</span>
        </div>
      </div>
    </div>
  );
};
