import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  GitBranch, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Sparkles,
  Zap,
  ShieldCheck,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const IntegrationsPage = () => {
  const { addToast } = useToast();
  const [bugs, setBugs] = useState([]);
  const [selectedBugKey, setSelectedBugKey] = useState('');
  const [prUrl, setPrUrl] = useState('https://github.com/testers-home/core/pull/105');
  const [commitHash, setCommitHash] = useState('9f4b12c');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  useEffect(() => {
    api.getBugs().then(data => {
      setBugs(data);
      if (data.length > 0) {
        setSelectedBugKey(data[0].key);
      }
    }).catch(() => {});
  }, []);

  const handleSimulateWebhook = async (e) => {
    e.preventDefault();
    if (!selectedBugKey) {
      addToast('Please select a target bug ticket', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: 'closed',
        pull_request: {
          title: `Fixes ${selectedBugKey} - Resolve race condition in auth token handler`,
          html_url: prUrl,
          merged: true,
          merged_at: new Date().toISOString(),
        },
        bugKey: selectedBugKey,
        prUrl,
        commitHash,
      };

      const result = await api.triggerGitWebhook(payload);
      setLastResponse(result);
      addToast(`Webhook received! ${selectedBugKey} moved to "Ready for QA"`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'info');
  };

  const webhookEndpoint = `${window.location.protocol}//${window.location.hostname}:5000/api/webhooks/git`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400">
              <GitPullRequest size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Git Webhook & CI/CD Integrations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Automatically update defect statuses to "Ready for QA" when PRs are merged via GitHub or GitLab webhooks.
          </p>
        </div>
      </div>

      {/* Webhook Endpoint Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Live Webhook Listener Endpoint
          </span>
          <div className="text-sm font-mono text-slate-200 select-all bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
            {webhookEndpoint}
          </div>
          <p className="text-xs text-slate-400">
            Set this as the Webhook Payload URL in your GitHub or GitLab repository settings.
          </p>
        </div>

        <button
          onClick={() => copyToClipboard(webhookEndpoint)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shrink-0"
        >
          <Copy size={14} />
          <span>Copy Webhook URL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Simulator Form */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Interactive Git Webhook Simulator</h3>
          </div>

          <form onSubmit={handleSimulateWebhook} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Target Defect Ticket *
              </label>
              <select
                value={selectedBugKey}
                onChange={(e) => setSelectedBugKey(e.target.value)}
                className="w-full glass-input text-sm"
                required
              >
                {bugs.map(b => (
                  <option key={b._id} value={b.key} className="bg-slate-900">
                    [{b.key}] {b.title} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Pull Request HTML URL
              </label>
              <input
                type="url"
                required
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="w-full glass-input font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                Git Commit Hash
              </label>
              <input
                type="text"
                required
                value={commitHash}
                onChange={(e) => setCommitHash(e.target.value)}
                className="w-full glass-input font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/50 active:scale-98"
            >
              <Send size={15} />
              <span>{loading ? 'Dispatched Webhook...' : 'Simulate PR Merge Webhook Event'}</span>
            </button>
          </form>

          {/* Response Box */}
          {lastResponse && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 size={15} />
                <span>Webhook Processed Successfully</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded-lg">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Integration Setup Instructions */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Terminal size={18} className="text-cyan-400" />
            <h3 className="text-base font-bold text-white">How GitHub / GitLab Sync Works</h3>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <strong className="text-white block font-sans">1. Commit Message or PR Title Rule</strong>
              <p>
                Developers reference the ticket key in their pull request title or commit message:
              </p>
              <code className="block bg-slate-900 p-2 rounded text-cyan-300 font-mono">
                git commit -m "Fixes THW-BUG-101: resolve null pointer on export"
              </code>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <strong className="text-white block font-sans">2. Automatic Ticket Transition</strong>
              <p>
                When the PR merges into <code className="text-slate-200 font-mono">main</code> or <code className="text-slate-200 font-mono">staging</code>, Tester's Home automatically:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans">
                <li>Moves status from <strong>In Progress</strong> ➔ <strong>Ready for QA</strong></li>
                <li>Attaches the PR link and commit hash to the bug ticket</li>
                <li>Emits a real-time WebSocket alert to QA engineers for re-testing</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <strong className="text-white block font-sans">3. QA Validation & Closure</strong>
              <p>
                QA re-tests the build and can verify & close the ticket with 1 click, or reopen if regression occurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

