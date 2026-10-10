import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send, 
  Code, 
  Paperclip, 
  ExternalLink,
  Laptop,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { StatusBadge, SeverityBadge } from '../ui/NeonBadge';
import { DevResolutionPanel } from './DevResolutionPanel';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BugModal = ({ isOpen, onClose, bugId, onUpdateBugList }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  const { user, isTester, isDeveloper } = useAuth();
  const { addToast, triggerConfetti } = useToast();

  const fetchBug = async () => {
    if (!bugId) return;
    setLoading(true);
    try {
      const res = await api.getBug(bugId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bugId) {
      fetchBug();
    }
  }, [isOpen, bugId]);

  if (!isOpen) return null;

  const bug = data?.bug;
  const comments = data?.comments || [];

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await api.updateBugStatus(bug._id, {
        status: newStatus,
        verificationNotes,
      });

      if (newStatus === 'Verified & Closed') {
        triggerConfetti();
        addToast(`🎉 Defect [${bug.key}] Verified & Closed!`, 'success');
      } else if (newStatus === 'Reopened') {
        addToast(`Defect [${bug.key}] Reopened for engineering fix`, 'cyber');
      }

      setData(prev => ({ ...prev, bug: updated }));
      if (onUpdateBugList) onUpdateBugList();
    } catch (err) {
      addToast(err.message || 'Status transition denied', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newComment = await api.addBugComment(bug._id, {
        content: commentText,
        codeSnippet: showCodeInput ? codeSnippet : undefined,
      });

      setData(prev => ({
        ...prev,
        comments: [...prev.comments, newComment],
      }));
      setCommentText('');
      setCodeSnippet('');
      setShowCodeInput(false);
      addToast('Comment posted', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={bug ? `[${bug.key}] Defect Details` : 'Loading...'} maxWidth="max-w-4xl">
      {loading || !bug ? (
        <div className="py-16 text-center text-slate-400 font-semibold text-sm animate-pulse">
          Fetching defect telemetry...
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <StatusBadge status={bug.status} />
                <SeverityBadge severity={bug.severity} />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Priority {bug.priority}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{bug.title}</h2>
            </div>

            {/* Reporter & Date */}
            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Reported by: <span className="text-cyan-300 font-bold">{bug.reporter?.name || 'QA Tester'}</span></div>
              <div className="text-slate-400 flex items-center justify-end gap-1.5">
                <Clock size={12} /> {new Date(bug.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Environment Specs */}
          {bug.environment && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">OS</span>
                <span className="text-slate-100 font-bold">{bug.environment.os}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Browser</span>
                <span className="text-slate-100 font-bold">{bug.environment.browser}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Device</span>
                <span className="text-slate-100 font-bold">{bug.environment.device}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Build</span>
                <span className="text-cyan-300 font-bold">{bug.environment.buildVersion}</span>
              </div>
            </div>
          )}

          {/* Reproduction Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Reproduction Steps
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {bug.reproductionSteps}
            </div>
          </div>

          {/* Side-by-side Expected vs Actual Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                <CheckCircle size={15} /> Expected Behavior
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {bug.expectedBehavior || 'No explicit expected behavior documented.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-rose-900/60 bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wide">
                <AlertTriangle size={15} /> Actual Behavior
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {bug.actualBehavior || 'No actual anomaly breakdown documented.'}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {bug.attachments && bug.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Paperclip size={14} /> Attachments & Recorded Clips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bug.attachments.map((att, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-700 bg-slate-950/70 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 truncate max-w-xs">{att.name}</span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1.5"
                    >
                      View Clip <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Developer Resolution Panel */}
          <DevResolutionPanel
            bug={bug}
            onUpdateBug={(updated) => {
              setData(prev => ({ ...prev, bug: updated }));
              if (onUpdateBugList) onUpdateBugList();
            }}
          />

          {/* QA Verification Panel (Tester / Admin Role Only per RBAC) */}
          {bug.status === 'Ready for QA' && (
            <div className="p-5 rounded-2xl border border-cyan-500/40 bg-cyan-950/25 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={15} /> QA Fix Verification Panel
                </div>
                {!isTester && (
                  <span className="text-xs font-bold text-amber-400">
                    QA Role Only (Switch to QA to Verify)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200">
                Developer has marked this ticket as fixed. Verify the build changes against the reproduction steps above.
              </p>

              {isTester && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Verification test notes (e.g., Passed regression in build v1.4.3)..."
                    className="w-full glass-input text-xs sm:text-sm"
                  />
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => handleStatusChange('Reopened')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                    >
                      <RotateCcw size={15} /> Reopen Ticket (Fix Failed)
                    </button>
                    <button
                      onClick={() => handleStatusChange('Verified & Closed')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-950/50"
                    >
                      <CheckCircle2 size={16} /> Verify Fix & Close Bug
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discussion Comments Thread */}
          <div className="pt-5 border-t border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Collaboration Stream & Diagnostic Logs ({comments.length})
            </h4>

            {/* Comment List */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {comments.map(c => (
                <div key={c._id} className="p-4 rounded-2xl border border-slate-700/80 bg-slate-950/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300 text-sm">{c.author?.name || 'Team Member'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase text-[10px] border border-slate-700">
                        {c.author?.role || 'QA'}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{c.content}</p>

                  {/* Syntax-highlighted code / logs block */}
                  {c.codeSnippet?.code && (
                    <div className="p-3.5 rounded-xl bg-black/90 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto mt-2">
                      <div className="text-[11px] text-slate-400 mb-1">// {c.codeSnippet.language} payload/trace:</div>
                      <pre className="leading-relaxed">{c.codeSnippet.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave comment or reproduction observation..."
                  className="flex-1 glass-input text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    showCodeInput ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Attach code snippet / payload"
                >
                  <Code size={16} />
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md"
                >
                  <Send size={15} />
                </button>
              </div>

              {showCodeInput && (
                <div className="animate-in fade-in duration-150">
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste JSON payload, stack trace, or code block..."
                    className="w-full glass-input font-mono text-xs text-cyan-300"
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
};
