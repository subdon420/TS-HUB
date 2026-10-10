import React, { useState } from 'react';
import { GitPullRequest, GitCommit, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DevResolutionPanel = ({ bug, onUpdateBug }) => {
  const { user, isDeveloper } = useAuth();
  const [gitPrLink, setGitPrLink] = useState(bug.gitPrLink || '');
  const [commitHash, setCommitHash] = useState(bug.commitHash || '');
  const [resolutionNotes, setResolutionNotes] = useState(bug.resolutionNotes || '');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleClaim = async () => {
    setLoading(true);
    try {
      const updated = await api.claimBug(bug._id);
      addToast(`Claimed [${bug.key}] for resolution! Status set to In Progress`, 'success');
      onUpdateBug(updated);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFixed = async () => {
    if (!gitPrLink && !commitHash) {
      addToast('Please provide a Git PR link or commit hash to verify resolution', 'error');
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateBugStatus(bug._id, {
        status: 'Ready for QA',
        gitPrLink,
        commitHash,
        resolutionNotes,
      });
      addToast(`Bug marked as Fixed! QA testers notified for verification`, 'cyber');
      onUpdateBug(updated);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isClaimedByMe = bug.assignee?._id === user?._id || bug.assignee === user?._id;

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
          <GitPullRequest size={15} />
          <span>Developer Resolution Panel</span>
        </div>
        {!isDeveloper && (
          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
            <ShieldAlert size={12} /> Read-only for QA
          </span>
        )}
      </div>

      {/* Claim Button */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
        <div>
          <div className="text-xs font-semibold text-slate-200">
            {bug.assignee ? `Assigned to: ${bug.assignee.name || 'Developer'}` : 'Unassigned Bug'}
          </div>
          <div className="text-[11px] text-slate-400">
            {isClaimedByMe ? 'You have claimed this defect.' : 'Claim to lock ticket and start working.'}
          </div>
        </div>

        {isDeveloper && (!bug.assignee || !isClaimedByMe) && bug.status !== 'Verified & Closed' && (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/50"
          >
            <UserCheck size={14} /> Claim Bug
          </button>
        )}
      </div>

      {/* Resolution inputs */}
      {isDeveloper && bug.status !== 'Verified & Closed' && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Git PR / Merge Link
              </label>
              <input
                type="text"
                value={gitPrLink}
                onChange={(e) => setGitPrLink(e.target.value)}
                placeholder="https://github.com/org/repo/pull/104"
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                Commit Hash
              </label>
              <input
                type="text"
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                placeholder="e.g. 7f4a9b2"
                className="w-full glass-input text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Resolution Notes & Root Cause Fix
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain fix mechanism for QA verification..."
              className="w-full glass-input text-xs"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleMarkFixed}
              disabled={loading || bug.status === 'Ready for QA'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-purple-950/50 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              <span>{bug.status === 'Ready for QA' ? 'Already Marked Fixed & Ready for QA' : 'Mark as Fixed & Ready for QA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Display existing resolution if already marked */}
      {bug.status === 'Ready for QA' && bug.gitPrLink && (
        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs space-y-1 font-mono">
          <div className="text-cyan-300 font-bold">Fix Delivered:</div>
          <div className="text-slate-300 truncate">PR: <a href={bug.gitPrLink} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{bug.gitPrLink}</a></div>
          {bug.commitHash && <div className="text-slate-400">Commit: {bug.commitHash}</div>}
          {bug.resolutionNotes && <div className="text-slate-300 font-sans mt-1">"{bug.resolutionNotes}"</div>}
        </div>
      )}
    </div>
  );
};

