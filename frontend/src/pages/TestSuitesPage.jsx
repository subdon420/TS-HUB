import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Search, 
  Play, 
  CheckSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { TestCaseCard } from '../components/tests/TestCaseCard';
import { TestCaseModal } from '../components/tests/TestCaseModal';
import { TestRunDrawer } from '../components/tests/TestRunDrawer';
import { AutoBugModal } from '../components/tests/AutoBugModal';
import { Modal } from '../components/ui/Modal';
import { GlassCard } from '../components/ui/GlassCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const TestSuitesPage = () => {
  const [searchParams] = useSearchParams();
  const { isTester } = useAuth();
  const { addToast } = useToast();

  const [suites, setSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('project') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeRunDrawer, setActiveRunDrawer] = useState(null);
  const [autoBugContext, setAutoBugContext] = useState(null);

  // Suite & Case creation states
  const [isCreateSuiteOpen, setIsCreateSuiteOpen] = useState(false);
  const [newSuiteTitle, setNewSuiteTitle] = useState('');
  const [newSuiteDesc, setNewSuiteDesc] = useState('');
  const [suiteProjectId, setSuiteProjectId] = useState('');

  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [selectedSuiteForNewCase, setSelectedSuiteForNewCase] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [casePreconditions, setCasePreconditions] = useState('');
  const [caseExpected, setCaseExpected] = useState('');
  const [caseSeverity, setCaseSeverity] = useState('Medium');

  const fetchSuitesAndProjects = async () => {
    setLoading(true);
    try {
      const [suitesData, projectsData] = await Promise.all([
        api.getSuites(selectedProjectId !== 'all' ? selectedProjectId : undefined),
        api.getProjects()
      ]);
      setSuites(suitesData);
      setProjects(projectsData);
      if (projectsData.length > 0 && !suiteProjectId) {
        setSuiteProjectId(projectsData[0]._id);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load test suites from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuitesAndProjects();
  }, [selectedProjectId]);

  const handleCreateSuite = async (e) => {
    e.preventDefault();
    try {
      await api.createSuite({
        title: newSuiteTitle,
        description: newSuiteDesc,
        projectId: suiteProjectId || (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?._id),
      });
      addToast(`Created test suite "${newSuiteTitle}"`, 'success');
      setIsCreateSuiteOpen(false);
      setNewSuiteTitle('');
      setNewSuiteDesc('');
      fetchSuitesAndProjects();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const targetSuite = suites.find(s => s._id === selectedSuiteForNewCase) || suites[0];
      if (!targetSuite) {
        addToast('Please select a valid test suite first', 'error');
        return;
      }

      await api.createTestCase({
        suiteId: targetSuite._id,
        projectId: targetSuite.project?._id || targetSuite.project,
        title: caseTitle,
        preconditions: casePreconditions,
        expectedOutcome: caseExpected,
        severity: caseSeverity,
        steps: [
          { stepNumber: 1, action: 'Execute test verification procedure', expectedOutcome: caseExpected }
        ]
      });

      addToast(`Created test case "${caseTitle}"`, 'success');
      setIsCreateCaseOpen(false);
      setCaseTitle('');
      setCasePreconditions('');
      setCaseExpected('');
      fetchSuitesAndProjects();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStartRun = async (suiteId, projId) => {
    try {
      const targetProjId = projId || (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?._id);
      const newRun = await api.startRun({
        projectId: targetProjId,
        suiteId,
        title: `Test Run Cycle - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        environment: 'Staging Environment',
      });
      setActiveRunDrawer(newRun);
      addToast('Test run cycle initialized! Opening execution runner...', 'cyber');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Metrics
  const stats = useMemo(() => {
    let totalSuites = suites.length;
    let totalCases = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    suites.forEach(s => {
      totalCases += s.totalCases || (s.testCases?.length || 0);
      totalPassed += s.passedCases || 0;
      totalFailed += s.failedCases || 0;
    });

    const passRate = totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : 0;
    return { totalSuites, totalCases, totalPassed, totalFailed, passRate };
  }, [suites]);

  const filteredSuites = useMemo(() => {
    if (!searchQuery.trim()) return suites;
    const q = searchQuery.toLowerCase();
    return suites.filter(s => 
      s.title.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.testCases && s.testCases.some(tc => tc.title.toLowerCase().includes(q) || tc.key.toLowerCase().includes(q)))
    );
  }, [suites, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7 font-sans">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Layers size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Test Case & Suite Repository
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Hierarchical breakdown of feature modules, preconditions, step-by-step assertions, and test outcomes.
          </p>
        </div>

        {isTester && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateSuiteOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
            >
              <Plus size={16} />
              <span>+ New Suite</span>
            </button>
            <button
              onClick={() => {
                if (suites.length > 0) {
                  setSelectedSuiteForNewCase(suites[0]._id);
                }
                setIsCreateCaseOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-950/50 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>Define Test Case</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Test Suites</span>
          <div className="text-2xl font-black text-white font-mono">{stats.totalSuites}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-cyan-400 block mb-1">Defined Test Cases</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{stats.totalCases}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">Passing Verifications</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.totalPassed}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-900/40 backdrop-blur-xl">
          <span className="text-xs font-semibold text-purple-400 block mb-1">Pass Ratio</span>
          <div className="text-2xl font-black text-purple-300 font-mono">{stats.passRate}%</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="relative min-w-[220px]">
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

        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test suites, cases, keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Suites & Cases List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Loading test hierarchy...</span>
        </div>
      ) : filteredSuites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/30 space-y-3">
          <Layers size={32} className="mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No Test Suites Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No test suites match the selected filters. Click "+ New Suite" to author a new test suite.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSuites.map(suite => {
            const cases = suite.testCases || [];
            const proj = suite.project;
            return (
              <GlassCard key={suite._id} hover={false} className="p-6 rounded-3xl border-slate-800/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      {proj && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
                          {proj.key}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white">{suite.title}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {cases.length} cases
                      </span>
                    </div>
                    {suite.description && (
                      <p className="text-xs sm:text-sm text-slate-400">{suite.description}</p>
                    )}
                  </div>

                  {isTester && (
                    <button
                      onClick={() => handleStartRun(suite._id, proj?._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-bold transition-all shadow-sm"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Execute Suite Run</span>
                    </button>
                  )}
                </div>

                {/* Cases List */}
                {cases.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono">
                    No test cases defined in this suite yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cases.map(tc => (
                      <TestCaseCard
                        key={tc._id}
                        testCase={tc}
                        onSelect={() => setSelectedCase(tc)}
                      />
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Case Details Modal */}
      <TestCaseModal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        testCase={selectedCase}
        onUpdateCase={fetchSuitesAndProjects}
      />

      {/* Execution Drawer */}
      <TestRunDrawer
        isOpen={!!activeRunDrawer}
        onClose={() => setActiveRunDrawer(null)}
        run={activeRunDrawer}
        onUpdateRun={(updated) => {
          setActiveRunDrawer(updated);
          fetchSuitesAndProjects();
        }}
        onTriggerAutoBug={(context) => {
          setAutoBugContext(context);
        }}
      />

      {/* Auto Bug Modal from Runner */}
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

      {/* Create Suite Modal */}
      <Modal isOpen={isCreateSuiteOpen} onClose={() => setIsCreateSuiteOpen(false)} title="➕ Create Test Suite" maxWidth="max-w-md">
        <form onSubmit={handleCreateSuite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Project *</label>
            <select
              value={suiteProjectId}
              onChange={(e) => setSuiteProjectId(e.target.value)}
              className="w-full glass-input text-sm"
              required
            >
              {projects.map(p => (
                <option key={p._id} value={p._id} className="bg-slate-900">[{p.key}] {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Suite Title *</label>
            <input
              type="text"
              required
              value={newSuiteTitle}
              onChange={(e) => setNewSuiteTitle(e.target.value)}
              placeholder="e.g. Authentication & RBAC Verification"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={newSuiteDesc}
              onChange={(e) => setNewSuiteDesc(e.target.value)}
              placeholder="Module test scope and preconditions..."
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
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Select Target Suite *</label>
            <select
              value={selectedSuiteForNewCase}
              onChange={(e) => setSelectedSuiteForNewCase(e.target.value)}
              className="w-full glass-input text-sm"
              required
            >
              {suites.map(s => (
                <option key={s._id} value={s._id} className="bg-slate-900">
                  {s.project?.key ? `[${s.project.key}] ` : ''}{s.title}
                </option>
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
              placeholder="e.g. Verify dual portal login isolation"
              className="w-full glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Severity</label>
            <select
              value={caseSeverity}
              onChange={(e) => setCaseSeverity(e.target.value)}
              className="w-full glass-input text-sm"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Preconditions</label>
            <input
              type="text"
              value={casePreconditions}
              onChange={(e) => setCasePreconditions(e.target.value)}
              placeholder="e.g. Server initialized, local MongoDB connected"
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
              placeholder="e.g. HTTP 403 response with access denied notification..."
              className="w-full glass-input text-sm"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setIsCreateCaseOpen(false)} className="px-3.5 py-2 text-xs font-medium text-slate-400">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm">
              Define Case
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

