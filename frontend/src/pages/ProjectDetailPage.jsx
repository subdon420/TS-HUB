import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  CheckSquare, 
  Play, 
  Activity, 
  Plus, 
  Filter, 
  Search, 
  Columns, 
  List, 
  GitPullRequest, 
  ExternalLink,
  ShieldCheck,
  Code2,
  ChevronDown,
  Layers,
  Sparkles,
  Video,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { BugCard } from '../components/bugs/BugCard';
import { BugModal } from '../components/bugs/BugModal';
import { BugCreateModal } from '../components/bugs/BugCreateModal';
import { TestCaseCard } from '../components/tests/TestCaseCard';
import { TestCaseModal } from '../components/tests/TestCaseModal';
import { TestRunDrawer } from '../components/tests/TestRunDrawer';
import { AutoBugModal } from '../components/tests/AutoBugModal';
import { ActivityStream } from '../components/collaboration/ActivityStream';
import { WebhookSimulatorModal } from '../components/collaboration/WebhookSimulatorModal';
import { StatusBadge, SeverityBadge } from '../components/ui/NeonBadge';
import { GlassCard } from '../components/ui/GlassCard';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

import { useParams, useNavigate } from 'react-router-dom';

export const ProjectDetailPage = ({ projectId: propProjectId, onBack: propOnBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const projectId = propProjectId || params.id;
  const onBack = propOnBack || (() => navigate('/projects'));

  const [activeTab, setActiveTab] = useState('bugs'); // 'bugs' | 'suites' | 'runs' | 'activity'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  
  // Data states
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bugFilterStatus, setBugFilterStatus] = useState('ALL');
  const [bugFilterSeverity, setBugFilterSeverity] = useState('ALL');
  const [bugSearch, setBugSearch] = useState('');
  const [devAssignedOnly, setDevAssignedOnly] = useState(false);

  // Modals & Drawers
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isCreateBugOpen, setIsCreateBugOpen] = useState(false);
  const [activeRunDrawer, setActiveRunDrawer] = useState(null);
  const [autoBugContext, setAutoBugContext] = useState(null);
  const [isWebhookSimOpen, setIsWebhookSimOpen] = useState(false);

  // New Suite Modal
  const [isCreateSuiteOpen, setIsCreateSuiteOpen] = useState(false);
  const [newSuiteTitle, setNewSuiteTitle] = useState('');
  const [newSuiteDesc, setNewSuiteDesc] = useState('');

  // New Case Modal
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [selectedSuiteForNewCase, setSelectedSuiteForNewCase] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [casePreconditions, setCasePreconditions] = useState('');
  const [caseExpected, setCaseExpected] = useState('');
  const [caseSeverity, setCaseSeverity] = useState('Medium');

  const { user, role, isTester, isDeveloper } = useAuth();
  const { addToast } = useToast();
  const { joinProject, leaveProject } = useSocket();

  const fetchProjectDetails = async () => {
    try {
      const data = await api.getProject(projectId);
      setProjectData(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      joinProject(projectId);
    }
    return () => {
      if (projectId) leaveProject(projectId);
    };
  }, [projectId]);

  if (loading || !projectData) {
    return (
      <div className="py-28 text-center text-slate-400 font-semibold text-base animate-pulse font-sans">
        Initializing Project Telemetry and Mongoose Collections...
      </div>
    );
  }

  const { project, bugs = [], suites = [], cases = [], recentRuns = [], activities = [] } = projectData;

  // Filter bugs
  const filteredBugs = bugs.filter(b => {
    if (bugFilterStatus !== 'ALL' && b.status !== bugFilterStatus) return false;
    if (bugFilterSeverity !== 'ALL' && b.severity !== bugFilterSeverity) return false;
    if (devAssignedOnly && (b.assignee?._id !== user?._id && b.assignee !== user?._id)) return false;
    if (bugSearch) {
      const q = bugSearch.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.key.toLowerCase().includes(q);
    }
    return true;
  });

  const kanbanColumns = [
    { id: 'Open', label: 'Open Defects', count: bugs.filter(b => b.status === 'Open').length, color: 'text-amber-300', dot: 'bg-amber-400' },
    { id: 'In Progress', label: 'In Progress (Dev)', count: bugs.filter(b => b.status === 'In Progress').length, color: 'text-purple-300', dot: 'bg-purple-400' },
    { id: 'Ready for QA', label: 'Ready for Retest', count: bugs.filter(b => b.status === 'Ready for QA').length, color: 'text-cyan-300', dot: 'bg-cyan-400' },
    { id: 'Verified & Closed', label: 'Verified & Closed', count: bugs.filter(b => b.status === 'Verified & Closed').length, color: 'text-emerald-300', dot: 'bg-emerald-400' },
  ];

  // Create Suite
  const handleCreateSuite = async (e) => {
    e.preventDefault();
    if (!newSuiteTitle) return;
    try {
      await api.createSuite({
        title: newSuiteTitle,
        description: newSuiteDesc,
        projectId,
      });
      addToast(`Test Suite "${newSuiteTitle}" created!`, 'success');
      setNewSuiteTitle('');
      setNewSuiteDesc('');
      setIsCreateSuiteOpen(false);
      fetchProjectDetails();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Create Test Case
  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!caseTitle || !selectedSuiteForNewCase) {
      addToast('Title and Suite are required', 'error');
      return;
    }
    try {
      await api.createTestCase({
        projectId,
        suiteId: selectedSuiteForNewCase,
        title: caseTitle,
        preconditions: casePreconditions,
        expectedOutcome: caseExpected,
        severity: caseSeverity,
      });
      addToast('Test case defined successfully!', 'success');
      setCaseTitle('');
      setCasePreconditions('');
      setCaseExpected('');
      setIsCreateCaseOpen(false);
      fetchProjectDetails();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Start Test Run
  const handleStartRun = async (suiteId = null) => {
    if (!isTester) {
      addToast('Developers have View-Only access to test runs.', 'error');
      return;
    }
    try {
      const newRun = await api.startRun({
        projectId,
        suiteId: suiteId || undefined,
        title: `Execution Cycle - ${new Date().toLocaleDateString()}`,
      });
      addToast(`Test Execution Cycle #${newRun.runNumber} initiated!`, 'cyber');
      setActiveRunDrawer(newRun);
      fetchProjectDetails();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-7 font-sans">
      {/* Top Breadcrumb & Project Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button onClick={onBack} className="hover:text-cyan-400 transition-colors">
              Projects
            </button>
            <span>/</span>
            <span className="text-cyan-300 font-mono font-bold">{project.key}</span>
            <span>•</span>
            <span className="text-slate-300">{project.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span>{project.name}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              Health: {project.healthScore || 94}%
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWebhookSimOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-all shadow-sm"
          >
            <GitPullRequest size={15} className="text-amber-400" />
            <span>Simulate PR Webhook</span>
          </button>

          {isTester ? (
            <>
              <button
                onClick={() => setIsCreateBugOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/50 transition-all hover:-translate-y-0.5"
              >
                <Plus size={16} />
                <span>+ Log Bug</span>
              </button>
              <button
                onClick={() => handleStartRun()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all hover:-translate-y-0.5"
              >
                <Play size={15} fill="currentColor" />
                <span>Start Test Run</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCreateBugOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all"
            >
              <Plus size={16} />
              <span>Report Anomaly</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-px">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeTab === 'bugs'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug size={17} />
            <span>Bug Hub ({bugs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suites')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeTab === 'suites'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare size={17} />
            <span>Test Suites & Cases ({cases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('runs')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeTab === 'runs'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play size={17} />
            <span>Test Runs ({recentRuns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${
              activeTab === 'activity'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/70 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={17} />
            <span>Event Stream</span>
          </button>
        </div>

        {/* View toggle for Bug Hub */}
        {activeTab === 'bugs' && (
          <div className="hidden sm:flex items-center p-1 rounded-xl border border-slate-700 bg-slate-950/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'kanban' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: BUG HUB */}
      {activeTab === 'bugs' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-700/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-slate-400 font-semibold text-xs">Filters:</span>
              <select
                value={bugFilterStatus}
                onChange={(e) => setBugFilterStatus(e.target.value)}
                className="glass-input text-xs py-1.5 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready for QA">Ready for QA</option>
                <option value="Verified & Closed">Verified & Closed</option>
              </select>

              <select
                value={bugFilterSeverity}
                onChange={(e) => setBugFilterSeverity(e.target.value)}
                className="glass-input text-xs py-1.5 font-medium"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Dev Quick Filter (Section 4.3) */}
              <button
                onClick={() => setDevAssignedOnly(!devAssignedOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  devAssignedOnly
                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-sm'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Assigned to Me
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={bugSearch}
                onChange={(e) => setBugSearch(e.target.value)}
                placeholder="Search bugs..."
                className="w-full glass-input pl-9 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Kanban View */}
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kanbanColumns.map(col => {
                const colBugs = filteredBugs.filter(b => b.status === col.id);
                return (
                  <div
                    key={col.id}
                    className="flex flex-col rounded-2xl border border-slate-700/80 bg-slate-950/50 p-3.5 min-h-[440px] shadow-sm"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                          {col.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                        {colBugs.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colBugs.map(b => (
                        <BugCard
                          key={b._id}
                          bug={b}
                          onClick={(bug) => setSelectedBugId(bug._id)}
                        />
                      ))}
                      {colBugs.length === 0 && (
                        <div className="py-14 text-center text-slate-500 font-medium text-xs italic">
                          No defects in {col.id}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2.5">
              {filteredBugs.map(b => (
                <div
                  key={b._id}
                  onClick={() => setSelectedBugId(b._id)}
                  className="p-4 rounded-2xl border border-slate-700/80 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-500 cursor-pointer flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-cyan-400 shrink-0 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {b.key}
                    </span>
                    <span className="text-sm font-semibold text-slate-100 truncate">{b.title}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <SeverityBadge severity={b.severity} />
                    <StatusBadge status={b.status} />
                    <span className="text-xs font-medium text-slate-300">
                      {b.assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEST SUITES & TEST CASES */}
      {activeTab === 'suites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Test Suite Hierarchy & Specifications
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Organized from Suites (Feature modules) to step-by-step test cases.
              </p>
            </div>

            {isTester && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsCreateSuiteOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
                >
                  <Plus size={15} /> + New Suite
                </button>
                <button
                  onClick={() => {
                    setSelectedSuiteForNewCase(suites[0]?._id || '');
                    setIsCreateCaseOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-md"
                >
                  <Plus size={15} /> + Define Test Case
                </button>
              </div>
            )}
          </div>

          {/* Suites Accordion List */}
          <div className="space-y-4">
            {suites.map(suite => {
              const suiteCases = cases.filter(c => c.suite?._id === suite._id || c.suite === suite._id);
              return (
                <GlassCard key={suite._id} hover={false} className="space-y-3.5 p-6 rounded-3xl border-slate-700/80">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-white">{suite.title}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {suiteCases.length} cases
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400">{suite.description}</p>
                    </div>

                    {isTester && (
                      <button
                        onClick={() => handleStartRun(suite._id)}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold transition-colors"
                      >
                        <Play size={14} fill="currentColor" /> Run Suite
                      </button>
                    )}
                  </div>

                  {/* Cases list */}
                  <div className="space-y-2.5">
                    {suiteCases.map(tc => (
                      <TestCaseCard
                        key={tc._id}
                        testCase={tc}
                        onClick={(c) => setSelectedCase(c)}
                      />
                    ))}
                    {suiteCases.length === 0 && (
                      <div className="py-8 text-center text-slate-500 font-medium text-xs">
                        No test cases defined in this suite yet.
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TEST RUNS */}
      {activeTab === 'runs' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Test Execution Cycles ({recentRuns.length})
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Fast execution drawer with Pass, Fail, Blocked, and auto-bug generation on failure.
              </p>
            </div>

            {isTester && (
              <button
                onClick={() => handleStartRun()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all"
              >
                <Play size={15} fill="currentColor" /> + New Run Cycle
              </button>
            )}
          </div>

          <div className="space-y-3">
            {recentRuns.map(run => (
              <div
                key={run._id}
                onClick={() => setActiveRunDrawer(run)}
                className="p-5 rounded-2xl border border-slate-700/80 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-500 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      Cycle #{run.runNumber}
                    </span>
                    <StatusBadge status={run.status} />
                    <span className="text-xs text-slate-400 font-medium">
                      {run.environment}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{run.title}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓ {run.passedCount} Pass</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400">✗ {run.failedCount} Fail</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{run.totalCases} Total</span>
                  </div>

                  <button className="px-3.5 py-1.5 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-200 text-xs font-bold hover:bg-cyan-900 transition-colors">
                    Open Drawer →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-TIME EVENT STREAM */}
      {activeTab === 'activity' && (
        <div className="space-y-5 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-white">
              Live Collaboration & Defect Event Stream
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Audit log of developer claims, fixes, QA validations, and automated Git merges.
            </p>
          </div>
          <ActivityStream activities={activities} />
        </div>
      )}

      {/* Modals & Popups */}
      <BugModal
        isOpen={!!selectedBugId}
        onClose={() => setSelectedBugId(null)}
        bugId={selectedBugId}
        onUpdateBugList={fetchProjectDetails}
      />

      <TestCaseModal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        testCase={selectedCase}
        onUpdateCase={fetchProjectDetails}
      />

      <BugCreateModal
        isOpen={isCreateBugOpen}
        onClose={() => setIsCreateBugOpen(false)}
        projectId={projectId}
        onBugCreated={fetchProjectDetails}
      />

      <TestRunDrawer
        isOpen={!!activeRunDrawer}
        onClose={() => setActiveRunDrawer(null)}
        run={activeRunDrawer}
        onUpdateRun={(updated) => {
          setActiveRunDrawer(updated);
          fetchProjectDetails();
        }}
        onTriggerAutoBug={(context) => {
          setAutoBugContext(context);
        }}
      />

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

      <WebhookSimulatorModal
        isOpen={isWebhookSimOpen}
        onClose={() => setIsWebhookSimOpen(false)}
        bugs={bugs}
        onSyncSuccess={fetchProjectDetails}
      />

      {/* Create Suite Modal */}
      <Modal isOpen={isCreateSuiteOpen} onClose={() => setIsCreateSuiteOpen(false)} title="➕ Create Test Suite" maxWidth="max-w-md">
        <form onSubmit={handleCreateSuite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Suite Title *</label>
            <input
              type="text"
              required
              value={newSuiteTitle}
              onChange={(e) => setNewSuiteTitle(e.target.value)}
              placeholder="e.g. Payment Gateway Webhooks"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={newSuiteDesc}
              onChange={(e) => setNewSuiteDesc(e.target.value)}
              placeholder="Module scope..."
              className="w-full glass-input text-sm"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setIsCreateSuiteOpen(false)} className="px-3.5 py-2 text-xs font-medium text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm">
              Create Suite
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Case Modal */}
      <Modal isOpen={isCreateCaseOpen} onClose={() => setIsCreateCaseOpen(false)} title="➕ Define Test Case" maxWidth="max-w-lg">
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Select Suite *</label>
            <select
              value={selectedSuiteForNewCase}
              onChange={(e) => setSelectedSuiteForNewCase(e.target.value)}
              className="w-full glass-input text-sm"
            >
              {suites.map(s => (
                <option key={s._id} value={s._id} className="bg-slate-900">{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Case Title *</label>
            <input
              type="text"
              required
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="e.g. Verify token expiration on idle timeout"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Preconditions</label>
            <input
              type="text"
              value={casePreconditions}
              onChange={(e) => setCasePreconditions(e.target.value)}
              placeholder="Active session with staging credentials"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Expected Outcome *</label>
            <textarea
              rows={2}
              required
              value={caseExpected}
              onChange={(e) => setCaseExpected(e.target.value)}
              placeholder="User redirected to login with notice..."
              className="w-full glass-input text-sm"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setIsCreateCaseOpen(false)} className="px-3.5 py-2 text-xs font-medium text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm">
              Save Test Case
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
