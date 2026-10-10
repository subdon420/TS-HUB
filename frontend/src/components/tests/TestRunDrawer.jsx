import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  SkipForward, 
  X, 
  Bug, 
  Sparkles,
  ShieldAlert,
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../ui/NeonBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TestRunDrawer = ({ 
  isOpen, 
  onClose, 
  run, 
  onUpdateRun, 
  onTriggerAutoBug 
}) => {
  const { isTester } = useAuth();
  const { addToast, triggerConfetti } = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !run) return null;

  const currentResult = run.results[selectedIndex];
  const testCase = currentResult?.testCase;

  const handleMarkResult = async (status) => {
    if (!isTester) {
      addToast('Developers have View-Only access to test execution. Switch to QA to mark results.', 'error');
      return;
    }

    if (status === 'Fail') {
      // Auto-Bug prompt on Failure!
      onTriggerAutoBug({
        testCase,
        notes,
        runId: run._id,
        onConfirmed: async (bugData) => {
          setLoading(true);
          try {
            const res = await api.recordCaseResult(run._id, {
              testCaseId: testCase._id,
              status: 'Fail',
              notes,
              autoBug: bugData,
            });
            addToast(`Marked Fail & Auto-Logged Bug for [${testCase.key}]!`, 'cyber');
            onUpdateRun(res.run);
            setNotes('');
            if (selectedIndex < run.results.length - 1) {
              setSelectedIndex(prev => prev + 1);
            }
          } catch (err) {
            addToast(err.message, 'error');
          } finally {
            setLoading(false);
          }
        }
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.recordCaseResult(run._id, {
        testCaseId: testCase._id,
        status,
        notes,
      });

      if (status === 'Pass') {
        addToast(`[${testCase.key}] Marked PASS`, 'success');
      }

      onUpdateRun(res.run);
      setNotes('');

      // Check if all test cases passed in completed run!
      if (res.run.status === 'Completed' && res.run.failedCount === 0) {
        triggerConfetti();
        addToast('🎉 All test cases passed in this cycle!', 'success');
      }

      if (selectedIndex < run.results.length - 1) {
        setSelectedIndex(prev => prev + 1);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = run.passedCount + run.failedCount + run.blockedCount + run.skippedCount;
  const progressPercent = run.totalCases > 0 ? Math.round((completedCount / run.totalCases) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-[#0c1222] border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                ⚡ FAST TEST EXECUTION DRAWER
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Cycle #{run.runNumber}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{run.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar & Counters */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Execution Progress: <strong className="text-cyan-400">{completedCount}</strong> / {run.totalCases} cases ({progressPercent}%)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">Pass: {run.passedCount}</span>
              <span className="text-rose-400">Fail: {run.failedCount}</span>
              <span className="text-amber-400">Blocked: {run.blockedCount}</span>
              <span className="text-slate-400">Skipped: {run.skippedCount}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(run.passedCount / (run.totalCases || 1)) * 100}%` }} />
            <div className="bg-rose-500 h-full transition-all" style={{ width: `${(run.failedCount / (run.totalCases || 1)) * 100}%` }} />
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${(run.blockedCount / (run.totalCases || 1)) * 100}%` }} />
          </div>
        </div>

        {/* Case List Navigation Pills */}
        <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-slate-800 bg-slate-900/30">
          {run.results.map((res, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                selectedIndex === idx
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-neon-cyan'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{res.testCase?.key || `TC #${idx + 1}`}</span>
              <span className={`h-2 w-2 rounded-full ${
                res.status === 'Pass' ? 'bg-emerald-400' :
                res.status === 'Fail' ? 'bg-rose-400' :
                res.status === 'Blocked' ? 'bg-amber-400' :
                res.status === 'Skipped' ? 'bg-slate-400' : 'bg-slate-600'
              }`} />
            </button>
          ))}
        </div>

        {/* Active Test Case Execution Area */}
        {testCase ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400">{testCase.key}</span>
                <StatusBadge status={currentResult.status} />
                <SeverityBadge severity={testCase.severity} />
              </div>
              <h2 className="text-lg font-bold text-slate-100">{testCase.title}</h2>
            </div>

            {/* Preconditions */}
            {testCase.preconditions && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Pre-conditions</span>
                <p className="text-xs text-slate-300 font-mono">{testCase.preconditions}</p>
              </div>
            )}

            {/* Steps Sequence */}
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-2 flex items-center gap-1.5">
                <ListOrdered size={14} /> Steps to Execute
              </span>
              <div className="space-y-2">
                {testCase.steps?.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs flex items-start gap-2.5">
                    <span className="font-mono font-bold text-cyan-400 text-[11px] shrink-0 mt-0.5">
                      {step.stepNumber || idx + 1}.
                    </span>
                    <div className="space-y-1">
                      <div className="text-slate-200 font-medium">{step.action}</div>
                      <div className="text-emerald-400 text-[11px] font-mono">
                        Expected: {step.expectedOutcome}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Result */}
            <div className="p-3.5 rounded-xl border border-emerald-950 bg-emerald-950/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Overall Expected Outcome</span>
              <p className="text-xs text-slate-200 font-medium">{testCase.expectedOutcome}</p>
            </div>

            {/* Execution Notes */}
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Execution Notes / Observational Logs
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed latency, step behavior, or failure details..."
                className="w-full glass-input text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-mono text-sm">
            Select a test case to execute.
          </div>
        )}

        {/* Bottom Fast Execution Control Buttons */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80">
          {!isTester ? (
            <div className="p-3 rounded-lg border border-amber-900/50 bg-amber-950/30 text-amber-300 text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>Developer mode active: View-Only test results. Switch to QA to record passes/failures.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                disabled={loading}
                onClick={() => handleMarkResult('Pass')}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-950/50 active:scale-95"
              >
                <CheckCircle2 size={16} /> PASS
              </button>

              <button
                disabled={loading}
                onClick={() => handleMarkResult('Fail')}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-rose-950/50 active:scale-95"
              >
                <XCircle size={16} /> FAIL (Auto-Bug)
              </button>

              <button
                disabled={loading}
                onClick={() => handleMarkResult('Blocked')}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all active:scale-95"
              >
                <AlertOctagon size={16} /> BLOCKED
              </button>

              <button
                disabled={loading}
                onClick={() => handleMarkResult('Skipped')}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all active:scale-95"
              >
                <SkipForward size={16} /> SKIP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

