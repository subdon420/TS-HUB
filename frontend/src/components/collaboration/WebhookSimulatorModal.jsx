import React, { useState } from 'react';
import { GitPullRequest, Send, CheckCircle2, GitCommit, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const WebhookSimulatorModal = ({ isOpen, onClose, bugs = [], onSyncSuccess }) => {
  const [selectedBugKey, setSelectedBugKey] = useState(bugs[0]?.key || 'THW-BUG-101');
  const [prUrl, setPrUrl] = useState('https://github.com/testers-home/repo/pull/142');
  const [commitHash, setCommitHash] = useState('9c4b78a');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.triggerGitWebhook({
        bugKey: selectedBugKey,
        prUrl,
        commitHash,
      });

      addToast(`Git Webhook Triggered: [${selectedBugKey}] is now "Ready for QA"!`, 'success');
      if (onSyncSuccess) onSyncSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Webhook trigger failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🐙 GitHub Webhook PR Merge Simulator" maxWidth="max-w-xl">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Simulate a real-time GitHub PR merge event. When merged, Tester’s Home automatically transitions the referenced bug ticket to <strong className="text-cyan-400">"Ready for QA"</strong> and notifies testers!
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Select Bug to Resolve via PR
            </label>
            <select
              value={selectedBugKey}
              onChange={(e) => setSelectedBugKey(e.target.value)}
              className="w-full glass-input"
            >
              {bugs.map(b => (
                <option key={b._id} value={b.key} className="bg-slate-900 text-slate-100">
                  [{b.key}] {b.title} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Pull Request URL
            </label>
            <input
              type="text"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="w-full glass-input"
              placeholder="https://github.com/org/repo/pull/..."
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Merge Commit Hash
            </label>
            <input
              type="text"
              value={commitHash}
              onChange={(e) => setCommitHash(e.target.value)}
              className="w-full glass-input font-mono"
              placeholder="e.g. 7fa98b2"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 space-y-1">
          <div className="text-cyan-400 font-bold">Simulated Webhook Payload:</div>
          <div>POST /api/webhooks/git</div>
          <div>{`{ "pull_request": { "merged": true, "title": "Fixes ${selectedBugKey}" } }`}</div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-950/40"
          >
            <GitPullRequest size={15} />
            <span>{loading ? 'Dispatching...' : 'Dispatch PR Merged Webhook'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

