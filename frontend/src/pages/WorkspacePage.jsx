import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  ShieldCheck, 
  Code2, 
  Database, 
  Copy, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  UserCog,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '../components/ui/GlassCard';

export const WorkspacePage = () => {
  const { user, role, switchRole } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbHealth, setDbHealth] = useState(null);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const [usersResult, healthResult] = await Promise.allSettled([
        api.getWorkspaceUsers(),
        api.getHealth()
      ]);

      if (usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)) {
        setMembers(usersResult.value);
      } else if (usersResult.status === 'fulfilled') {
        setMembers([]);
      }

      if (healthResult.status === 'fulfilled') {
        setDbHealth(healthResult.value);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load workspace data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`Copied ${label} to clipboard!`, 'info');
  };

  const compassUri = 'mongodb://127.0.0.1:27017/testers_home';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-400">
              <Building size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Workspace & Team Governance
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage organization members, RBAC permissions, and inspect MongoDB Compass connection.
          </p>
        </div>

        <button
          onClick={fetchWorkspaceData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Workspace Profile & Invite Code Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Workspace Hub</span>
          <div className="text-xl font-bold text-white">
            {user?.workspace?.name || 'Alpha QA Labs & Dev Core'}
          </div>
          <div className="text-xs text-slate-400">
            Dedicated workspace for dual QA and development testing.
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-cyan-900/40 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400">Workspace Invite Code</span>
            <button
              onClick={() => copyToClipboard(user?.workspace?.code || 'ALPHA-QA', 'Invite Code')}
              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-bold"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono tracking-wider">
            {user?.workspace?.code || 'ALPHA-QA'}
          </div>
          <div className="text-xs text-slate-400">
            Share this code for team members to join during sign-up.
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-emerald-900/40 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Database Status</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {dbHealth?.database?.connected !== false ? 'Connected' : 'Offline'}
          </div>
          <div className="text-xs text-slate-400">
            MongoDB Server listening on port 27017.
          </div>
        </div>
      </div>

      {/* MongoDB Compass Connection Inspector Box */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/50 border border-emerald-500/30 backdrop-blur-xl space-y-4 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database size={20} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white">MongoDB Compass Native Connection</h3>
          </div>
          <button
            onClick={() => copyToClipboard(compassUri, 'Compass URI')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all shadow-sm"
          >
            <Copy size={13} />
            <span>Copy Compass URI</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-medium">Connection String:</div>
          <div className="font-mono text-sm text-emerald-300 font-bold select-all break-all">
            {compassUri}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">HOST</span>
            <span className="text-slate-200 font-bold">
              {dbHealth?.database?.host ? `${dbHealth.database.host}:${dbHealth.database.port}` : '127.0.0.1:27017'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">DATABASE</span>
            <span className="text-slate-200 font-bold">
              {dbHealth?.database?.name || 'testers_home'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">COLLECTIONS</span>
            <span className="text-slate-200 font-bold">
              {dbHealth?.database?.collections?.length || 9} Collections
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">DRIVER</span>
            <span className="text-slate-200 font-bold">Mongoose 8+</span>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-slate-400" />
            <h3 className="text-base font-bold text-white">Active Team Members ({members.length})</h3>
          </div>
        </div>

        <div className="p-2 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Work Email</th>
                <th className="py-3 px-4">Professional Title</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(Array.isArray(members) ? members : []).map(m => {
                const isQA = m.role === 'tester';
                const isDev = m.role === 'developer';
                const isAdmin = m.role === 'admin';

                return (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.email}`}
                          alt={m.name}
                          className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700"
                        />
                        <span className="font-bold text-slate-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {m.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {m.title || (isDev ? 'Software Engineer' : 'QA Engineer')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${
                        isAdmin
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          : isDev
                            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                            : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {isAdmin ? <UserCog size={12} /> : isDev ? <Code2 size={12} /> : <ShieldCheck size={12} />}
                        {isAdmin ? 'Admin' : isDev ? 'Developer' : 'QA Tester'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

