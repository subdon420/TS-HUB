import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bug, 
  Plus, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  GitPullRequest,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BugCard } from '../components/bugs/BugCard';
import { BugModal } from '../components/bugs/BugModal';
import { BugCreateModal } from '../components/bugs/BugCreateModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const BugsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isTester, isDeveloper, role } = useAuth();
  const { addToast } = useToast();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeBugId, setActiveBugId] = useState(searchParams.get('id') || null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchBugsAndProjects = async () => {
    setLoading(true);
    try {
      const [bugsData, projectsData] = await Promise.all([
        api.getBugs(selectedProjectId !== 'all' ? { project: selectedProjectId } : {}),
        api.getProjects()
      ]);
      setBugs(bugsData);
      setProjects(projectsData);
    } catch (err) {
      console.error(err);
      addToast('Failed to load defects list from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugsAndProjects();
  }, [selectedProjectId]);

  const filteredBugs = useMemo(() => {
    return bugs.filter(bug => {
      // Status filter
      if (selectedStatus !== 'all' && bug.status !== selectedStatus) return false;
      // Severity filter
      if (selectedSeverity !== 'all' && bug.severity !== selectedSeverity) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesKey = bug.key.toLowerCase().includes(q);
        const matchesTitle = bug.title.toLowerCase().includes(q);
        const matchesReporter = bug.reporter?.name?.toLowerCase().includes(q);
        const matchesAssignee = bug.assignee?.name?.toLowerCase().includes(q);
        if (!matchesKey && !matchesTitle && !matchesReporter && !matchesAssignee) return false;
      }
      return true;
    });
  }, [bugs, selectedStatus, selectedSeverity, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = bugs.length;
    const critical = bugs.filter(b => b.severity === 'Critical').length;
    const readyForQA = bugs.filter(b => b.status === 'Ready for QA').length;
    const open = bugs.filter(b => b.status === 'Open' || b.status === 'Draft').length;
    const verified = bugs.filter(b => b.status === 'Verified & Closed').length;
    return { total, critical, readyForQA, open, verified };
  }, [bugs]);

  const statusOptions = [
    'all',
    'Open',
    'In Progress',
    'Ready for QA',
    'Verified & Closed',
    'Reopened',
    'Draft'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400">
              <Bug size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Defect & Bug Tracking Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            End-to-end defect management across all workspace projects with AI polish and Git PR linking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-950/50 hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span>Log New Defect</span>
          </button>
        </div>
      </div>

      {/* Metrics Ticker Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Defects</span>
          <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-rose-400 block mb-1">Critical Severity</span>
          <div className="text-2xl font-black text-rose-400 font-mono">{stats.critical}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-amber-400 block mb-1">Open / Triage</span>
          <div className="text-2xl font-black text-amber-300 font-mono">{stats.open}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-cyan-400 block mb-1">Ready for QA</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{stats.readyForQA}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 backdrop-blur-xl col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">Verified & Closed</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.verified}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Project Selector */}
          <div className="relative min-w-[180px]">
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

          {/* Severity Selector */}
          <div className="relative min-w-[130px]">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {statusOptions.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key, title, assignee..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Bugs Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Loading defect repository...</span>
        </div>
      ) : filteredBugs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/30 space-y-3">
          <Bug size={32} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Defects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No defect reports match the current filter criteria. You can clear filters or log a new bug ticket.
          </p>
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSelectedSeverity('all');
              setSelectedProjectId('all');
              setSearchQuery('');
            }}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBugs.map(bug => (
            <BugCard
              key={bug._id}
              bug={bug}
              onSelect={(b) => setActiveBugId(b._id)}
              onStatusChange={fetchBugsAndProjects}
            />
          ))}
        </div>
      )}

      {/* Bug Details Modal */}
      <BugModal
        isOpen={!!activeBugId}
        bugId={activeBugId}
        onClose={() => setActiveBugId(null)}
        onUpdateBugList={fetchBugsAndProjects}
      />

      {/* Bug Create Modal */}
      <BugCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={selectedProjectId !== 'all' ? selectedProjectId : projects[0]?._id}
        onBugCreated={fetchBugsAndProjects}
      />
    </div>
  );
};

