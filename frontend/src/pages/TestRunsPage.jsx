import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Activity,
  Layers,
  Sparkles,
  Server
} from 'lucide-react';
import { TestRunDrawer } from '../components/tests/TestRunDrawer';
import { AutoBugModal } from '../components/tests/AutoBugModal';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TestRunsPage = () => {
  const { id: routeRunId } = useParams();
  const [searchParams] = useSearchParams();
  const { isTester } = useAuth();
  const { addToast } = useToast();

  const [runs, setRuns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Runner Drawer
  const [activeRunDrawer, setActiveRunDrawer] = useState(null);
  const [autoBugContext, setAutoBugContext] = useState(null);

  // Start New Run Modal
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [newRunTitle, setNewRunTitle] = useState('');
  const [newRunProjectId, setNewRunProjectId] = useState('');
  const [newRunSuiteId, setNewRunSuiteId] = useState('');
  const [newRunEnv, setNewRunEnv] = useState('Staging Environment');

  const fetchRunsAndData = async () => {
    setLoading(true);
    try {
      const [runsData, projectsData, suitesData] = await Promise.all([
        api.getRuns(selectedProjectId !== 'all' ? selectedProjectId : undefined),
        api.getProjects(),
        api.getSuites(selectedProjectId !== 'all' ? selectedProjectId : undefined)
      ]);
      setRuns(runsData);
      setProjects(projectsData);
      setSuites(suitesData);

      if (projectsData.length > 0 && !newRunProjectId) {
        setNewRunProjectId(projectsData[0]._id);
      }

      // If route has specific run id (e.g. /test-runs/:id)
      if (routeRunId) {
        const target = runsData.find(r => r._id === routeRunId);
        if (target) {
          setActiveRunDrawer(target);
        } else {
          api.getRun(routeRunId).then(setActiveRunDrawer).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load test runs from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunsAndData();
  }, [selectedProjectId, routeRunId]);

  const handleStartRun = async (e) => {
    e.preventDefault();
    try {
      const run = await api.startRun({
        projectId: newRunProjectId,
        suiteId: newRunSuiteId || undefined,
        title: newRunTitle || `Execution Cycle #${runs.length + 1}`,
        environment: newRunEnv,
      });
      addToast(`Initiated test run "${run.title}"`, 'success');
      setIsStartOpen(false);
      setNewRunTitle('');
      setActiveRunDrawer(run);
      fetchRunsAndData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredRuns = useMemo(() => {
    return runs.filter(run => {
      if (selectedStatus !== 'all' && run.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = run.title.toLowerCase().includes(q);
        const matchesEnv = run.environment?.toLowerCase().includes(q);
        const matchesUser = run.executedBy?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEnv && !matchesUser) return false;
      }
      return true;
    });
  }, [runs, selectedStatus, searchQuery]);

  // Metrics
  const stats = useMemo(() => {
    const total = runs.length;
    const inProgress = runs.filter(r => r.status === 'In Progress').length;
    const completed = runs.filter(r => r.status === 'Completed').length;
    let totalCasesExecuted = 0;
    let totalPassed = 0;
    runs.forEach(r => {
      totalCasesExecuted += (r.passedCount || 0) + (r.failedCount || 0) + (r.blockedCount || 0);
      totalPassed += (r.passedCount || 0);
    });
    return { total, inProgress, completed, totalCasesExecuted, totalPassed };
  }, [runs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <Play size={20} fill="currentColor" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Test Execution Hub & Cycles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time test run cycles with rapid drawer assertions, auto-bug filing on failure, and pass rate analytics.
          </p>
        </div>

        {isTester && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStartOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-950/50 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>Initiate Test Run</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Cycles</span>
          <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-amber-400 block mb-1">In Execution</span>
          <div className="text-2xl font-black text-amber-300 font-mono">{stats.inProgress}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">Completed Cycles</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.completed}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-cyan-400 block mb-1">Assertions Passed</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{stats.totalPassed}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px]">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>[{p.key}] {p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {['all', 'In Progress', 'Completed'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {st === 'all' ? 'All Runs' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search run title, environment..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Runs List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Loading execution runs...</span>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/30 space-y-3">
          <Play size={32} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Test Runs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No test runs match the filters. Click "Initiate Test Run" to start an execution cycle.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRuns.map(run => {
            const passPercent = run.totalCases > 0 ? Math.round((run.passedCount / run.totalCases) * 100) : 0;
            const failPercent = run.totalCases > 0 ? Math.round((run.failedCount / run.totalCases) * 100) : 0;
            const blockedPercent = run.totalCases > 0 ? Math.round((run.blockedCount / run.totalCases) * 100) : 0;

            return (
              <GlassCard
                key={run._id}
                onClick={() => setActiveRunDrawer(run)}
                className="p-6 rounded-3xl border-slate-800/90 hover:border-emerald-500/40 cursor-pointer space-y-4 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      {run.project?.key && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
                          {run.project.key}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {run.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        run.status === 'Completed'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      }`}>
                        {run.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Server size={13} className="text-cyan-400" />
                        {run.environment || 'Staging'}
                      </span>
                      <span>•</span>
                      <span>{run.totalCases} test cases</span>
                      <span>•</span>
                      <span>Run by: <strong className="text-slate-300">{run.executedBy?.name || 'QA Engineer'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock size={11} /> {new Date(run.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRunDrawer(run);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold transition-all shadow-sm"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>{run.status === 'In Progress' ? 'Execute Cycle' : 'Review Results'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar breakdown */}
                <div className="space-y-2">
                  <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                    {run.passedCount > 0 && (
                      <div style={{ width: `${passPercent}%` }} className="bg-emerald-500" title={`Pass: ${run.passedCount}`} />
                    )}
                    {run.failedCount > 0 && (
                      <div style={{ width: `${failPercent}%` }} className="bg-rose-500" title={`Fail: ${run.failedCount}`} />
                    )}
                    {run.blockedCount > 0 && (
                      <div style={{ width: `${blockedPercent}%` }} className="bg-amber-500" title={`Blocked: ${run.blockedCount}`} />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400 font-semibold">✓ {run.passedCount} Passed</span>
                      <span className="text-rose-400 font-semibold">✗ {run.failedCount} Failed</span>
                      <span className="text-amber-400 font-semibold">⚠ {run.blockedCount || 0} Blocked</span>
                      <span className="text-slate-500">○ {run.totalCases - (run.passedCount + run.failedCount + (run.blockedCount || 0))} Untested</span>
                    </div>
                    <span className="font-bold text-slate-200">{passPercent}% Pass Rate</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Fast Execution Drawer */}
      <TestRunDrawer
        isOpen={!!activeRunDrawer}
        onClose={() => setActiveRunDrawer(null)}
        run={activeRunDrawer}
        onUpdateRun={(updated) => {
          setActiveRunDrawer(updated);
          fetchRunsAndData();
        }}
        onTriggerAutoBug={(context) => {
          setAutoBugContext(context);
        }}
      />

      {/* Auto Bug Modal */}
      <AutoBugModal
        isOpen={!!autoBugContext}
        onClose={() => setAutoBugContext(null)}
        contextData={autoBugContext}
        onConfirm={(bugData) => {
          if (autoBugContext?.onConfirmed) {
            autoBugContext.onConfirmed(bugData);
          }
        }}
      />

      {/* Start New Run Modal */}
      <Modal isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} title="⚡ Initiate Test Execution Cycle" maxWidth="max-w-md">
        <form onSubmit={handleStartRun} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Project *</label>
            <select
              value={newRunProjectId}
              onChange={(e) => {
                setNewRunProjectId(e.target.value);
                api.getSuites(e.target.value).then(setSuites).catch(() => {});
              }}
              className="w-full glass-input text-sm"
              required
            >
              {projects.map(p => (
                <option key={p._id} value={p._id} className="bg-slate-900">[{p.key}] {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Select Suite (Optional)</label>
            <select
              value={newRunSuiteId}
              onChange={(e) => setNewRunSuiteId(e.target.value)}
              className="w-full glass-input text-sm"
            >
              <option value="">All Test Suites in Project</option>
              {suites.map(s => (
                <option key={s._id} value={s._id} className="bg-slate-900">{s.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Cycle Title *</label>
            <input
              type="text"
              required
              value={newRunTitle}
              onChange={(e) => setNewRunTitle(e.target.value)}
              placeholder="e.g. Smoke Test Cycle v2.4.0-rc"
              className="w-full glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Environment</label>
            <input
              type="text"
              value={newRunEnv}
              onChange={(e) => setNewRunEnv(e.target.value)}
              placeholder="e.g. Staging Environment / Cloud Cluster"
              className="w-full glass-input text-sm"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setIsStartOpen(false)} className="px-3.5 py-2 text-xs font-medium text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm">
              Launch Run
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

