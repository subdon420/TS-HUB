import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  Code2, 
  Bug, 
  GitPullRequest, 
  CheckCircle2, 
  RotateCcw,
  Search,
  Filter,
  UserCheck,
  Terminal,
  MessageSquare,
  Layers,
  Sparkles
} from 'lucide-react';

export const ActivityStream = ({ activities = [] }) => {
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'tester' | 'developer'
  const [searchQuery, setSearchQuery] = useState('');

  // Classify an activity as tester or developer
  const getLogRole = (act) => {
    if (act.userRole) return act.userRole;
    if (act.user?.role) return act.user?.role;
    // Fallback based on action type
    const devActions = ['CLAIMED_BUG', 'GIT_WEBHOOK_MERGED'];
    if (devActions.includes(act.action)) return 'developer';
    return 'tester';
  };

  const testerActivities = useMemo(() => {
    return activities.filter(act => getLogRole(act) === 'tester');
  }, [activities]);

  const developerActivities = useMemo(() => {
    return activities.filter(act => getLogRole(act) === 'developer');
  }, [activities]);

  const filteredActivities = useMemo(() => {
    let list = activities;
    if (filterRole === 'tester') {
      list = testerActivities;
    } else if (filterRole === 'developer') {
      list = developerActivities;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(act => 
        (act.message && act.message.toLowerCase().includes(q)) ||
        (act.entityTitle && act.entityTitle.toLowerCase().includes(q)) ||
        (act.user?.name && act.user.name.toLowerCase().includes(q)) ||
        (act.action && act.action.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activities, filterRole, testerActivities, developerActivities, searchQuery]);

  const getActionIcon = (action, role) => {
    switch (action) {
      case 'LOGGED_BUG':
      case 'AUTO_BUG_CREATED':
        return <Bug size={14} className="text-rose-400" />;
      case 'STATUS_TRANSITION':
        return <CheckCircle2 size={14} className="text-cyan-400" />;
      case 'CLAIMED_BUG':
        return <Code2 size={14} className="text-purple-400" />;
      case 'GIT_WEBHOOK_MERGED':
        return <GitPullRequest size={14} className="text-amber-400" />;
      case 'CREATED_TEST_SUITE':
      case 'CREATED_TEST_CASE':
        return <Layers size={14} className="text-cyan-300" />;
      case 'STARTED_TEST_RUN':
        return <Sparkles size={14} className="text-emerald-400" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={14} className="text-indigo-400" />;
      default:
        return role === 'developer' 
          ? <Code2 size={14} className="text-purple-400" /> 
          : <ShieldCheck size={14} className="text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header Tabs: Separate Logs for Testers and Devs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterRole('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filterRole === 'all'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity size={13} />
            <span>All Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] text-slate-300 font-mono">
              {activities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterRole('tester')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              filterRole === 'tester'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'border-transparent text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30'
            }`}
          >
            <ShieldCheck size={13} className="text-cyan-400" />
            <span>QA Tester Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-[10px] text-cyan-300 font-mono">
              {testerActivities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterRole('developer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              filterRole === 'developer'
                ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                : 'border-transparent text-slate-400 hover:text-purple-300 hover:bg-purple-950/30'
            }`}
          >
            <Code2 size={13} className="text-purple-400" />
            <span>Developer Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-950 text-[10px] text-purple-300 font-mono">
              {developerActivities.length}
            </span>
          </button>
        </div>

        {/* Filter Search */}
        <div className="relative min-w-[200px]">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity events..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Role Context Notification Bar */}
      <div className={`p-2.5 px-3.5 rounded-xl border text-xs flex items-center justify-between ${
        filterRole === 'tester'
          ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
          : filterRole === 'developer'
            ? 'bg-purple-950/20 border-purple-500/30 text-purple-200'
            : 'bg-slate-900/40 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          {filterRole === 'tester' ? (
            <>
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>Showing QA operations: Bug filings, suite creations, execution runs, test verifications</span>
            </>
          ) : filterRole === 'developer' ? (
            <>
              <Code2 size={14} className="text-purple-400" />
              <span>Showing Developer operations: Ticket claims, code fixes, PR merges, technical comments</span>
            </>
          ) : (
            <>
              <Activity size={14} className="text-slate-400" />
              <span>Complete unified audit trail across all QA testers and software developers</span>
            </>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {filteredActivities.length} event{filteredActivities.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Activities List */}
      <div className="space-y-2.5">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/30 space-y-2">
            <Activity size={24} className="mx-auto text-slate-600 animate-pulse" />
            <p className="text-slate-400 text-xs font-semibold">
              No matching activity events found in {filterRole === 'all' ? 'stream' : `${filterRole} logs`}.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((act, idx) => {
            const role = getLogRole(act);
            const isDev = role === 'developer';
            const isTester = role === 'tester';

            return (
              <div
                key={act._id || idx}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 text-xs group ${
                  isDev
                    ? 'border-purple-500/20 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40'
                    : 'border-cyan-500/20 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40'
                }`}
              >
                {/* Left Role & Action Icon */}
                <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                  isDev 
                    ? 'bg-purple-950/60 border-purple-500/40 shadow-sm' 
                    : 'bg-cyan-950/60 border-cyan-500/40 shadow-sm'
                }`}>
                  {getActionIcon(act.action, role)}
                </div>

                {/* Event Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Role Pill */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide border ${
                        isDev
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {isDev ? <Code2 size={10} /> : <ShieldCheck size={10} />}
                        {isDev ? 'Developer' : 'QA Tester'}
                      </span>

                      {act.entityTitle && (
                        <span className="text-[11px] font-mono font-medium text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                          {act.entityTitle}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                      <Clock size={11} /> {new Date(act.createdAt || act.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Log message */}
                  <div className="text-slate-200 font-medium leading-relaxed">
                    {act.message}
                  </div>

                  {/* Actor details & Meta details */}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 font-sans font-semibold text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${isDev ? 'bg-purple-400' : 'bg-cyan-400'}`} />
                      {act.user?.name || (isDev ? 'Samira Chen (Dev Lead)' : 'Alex Rivera (QA Lead)')}
                    </span>

                    {act.meta?.gitPrLink && (
                      <a
                        href={act.meta.gitPrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                      >
                        <GitPullRequest size={10} /> PR Link
                      </a>
                    )}

                    {act.meta?.severity && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-rose-400 border border-rose-500/30">
                        {act.meta.severity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
