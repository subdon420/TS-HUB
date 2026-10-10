import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bug, 
  ArrowLeft, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  Clock, 
  GitPullRequest, 
  MessageSquare, 
  Sparkles,
  Paperclip,
  Share2
} from 'lucide-react';
import { SeverityBadge, StatusBadge, PriorityBadge } from '../components/ui/NeonBadge';
import { DevResolutionPanel } from '../components/bugs/DevResolutionPanel';
import { AIPolishModal } from '../components/bugs/AIPolishModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const BugDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTester, isDeveloper } = useAuth();
  const { addToast } = useToast();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isAIPolishOpen, setIsAIPolishOpen] = useState(false);

  const fetchBug = async () => {
    setLoading(true);
    try {
      const data = await api.getBug(id);
      setBug(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load defect ticket from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBug();
  }, [id]);

  const handleStatusChange = async (newStatus, extraData = {}) => {
    try {
      await api.updateBugStatus(bug._id, { status: newStatus, ...extraData });
      addToast(`Status updated to ${newStatus}`, 'success');
      fetchBug();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !codeSnippet.trim()) return;

    try {
      await api.addBugComment(bug._id, {
        content: newComment,
        codeSnippet: codeSnippet.trim() ? codeSnippet : undefined,
      });
      setNewComment('');
      setCodeSnippet('');
      setShowCodeInput(false);
      addToast('Comment published to thread', 'success');
      fetchBug();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <div className="h-8 w-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mx-auto mb-3" />
        <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Loading defect ticket...</span>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3 font-sans">
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">The requested bug ticket does not exist or was deleted.</p>
        <button
          onClick={() => navigate('/bugs')}
          className="text-xs font-bold text-cyan-400 hover:underline"
        >
          ← Return to Bug Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/bugs')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Defect Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-300">
            {bug.project?.name ? `[${bug.project.name}]` : ''}
          </span>
        </div>
      </div>

      {/* Ticket Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-base font-black font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-rose-400">
              {bug.key}
            </span>
            <SeverityBadge severity={bug.severity} />
            <PriorityBadge priority={bug.priority} />
            <StatusBadge status={bug.status} />
          </div>

          {/* QA Verification Action Buttons */}
          {isTester && (
            <div className="flex items-center gap-2">
              {bug.status === 'Ready for QA' && (
                <button
                  onClick={() => handleStatusChange('Verified & Closed')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  <CheckCircle2 size={14} />
                  <span>Verify Fix & Close</span>
                </button>
              )}
              {bug.status === 'Verified & Closed' && (
                <button
                  onClick={() => handleStatusChange('Reopened')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <span>Reopen Defect</span>
                </button>
              )}
            </div>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {bug.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
          <span>Reported by: <strong className="text-slate-300 font-sans">{bug.reporter?.name || 'QA Lead'}</strong></span>
          <span>•</span>
          <span>Assigned: <strong className="text-slate-300 font-sans">{bug.assignee?.name || 'Unassigned'}</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {new Date(bug.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Developer Claim / Resolution Panel */}
      {isDeveloper && (
        <DevResolutionPanel
          bug={bug}
          onUpdateBug={fetchBug}
        />
      )}

      {/* Side-by-side Expected vs Actual Behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
            Expected Behavior
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {bug.expectedBehavior || 'Feature executes according to acceptance criteria.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase text-rose-400 tracking-wider">
            Actual Behavior (Defect)
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {bug.actualBehavior || 'Runtime error or assertion failure observed.'}
          </p>
        </div>
      </div>

      {/* Reproduction Steps */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
            Reproduction Steps
          </span>
          <button
            onClick={() => setIsAIPolishOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/60 transition-colors"
          >
            <Sparkles size={13} />
            <span>AI Polish</span>
          </button>
        </div>
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed p-3 bg-slate-950 rounded-xl border border-slate-800/80">
          {bug.reproductionSteps || '1. Navigate to view\n2. Trigger action'}
        </pre>
      </div>

      {/* Discussion & Collaboration Comments */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <MessageSquare size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Engineering Discussion ({bug.comments?.length || 0})</h3>
        </div>

        <div className="space-y-3">
          {bug.comments?.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-mono">
              No technical comments posted yet.
            </div>
          ) : (
            bug.comments?.map((c, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{c.author?.name || 'Engineer'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">{c.content}</p>
                {c.codeSnippet?.code && (
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto">
                    {c.codeSnippet.code}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 pt-3 border-t border-slate-800">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a technical note or triage question..."
            className="w-full glass-input text-xs"
          />

          {showCodeInput && (
            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste code snippet, stack trace, or payload JSON..."
              className="w-full glass-input font-mono text-[11px] text-cyan-300"
            />
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              {showCodeInput ? '− Hide code block' : '+ Attach code/log snippet'}
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Post Comment
            </button>
          </div>
        </form>
      </div>

      {/* AI Polish Modal */}
      <AIPolishModal
        isOpen={isAIPolishOpen}
        onClose={() => setIsAIPolishOpen(false)}
        initialContent={bug.reproductionSteps}
        onApply={(polished) => {
          api.updateBugStatus(bug._id, { reproductionSteps: polished }).then(fetchBug);
        }}
      />
    </div>
  );
};

