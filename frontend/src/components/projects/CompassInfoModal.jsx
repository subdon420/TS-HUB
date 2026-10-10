import React, { useState, useEffect } from 'react';
import { Database, Check, Copy, RefreshCw, Server, Layers, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CompassInfoModal = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const copyUri = () => {
    navigator.clipboard.writeText('mongodb://127.0.0.1:27017');
    setCopied(true);
    addToast('MongoDB URI copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧭 MongoDB Compass Connection & Database Info" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <p className="text-sm text-slate-300">
          This application stores all QA test runs, bugs, test suites, and collaboration logs in your local MongoDB instance. You can inspect all raw JSON documents directly in <strong className="text-emerald-400">MongoDB Compass</strong>.
        </p>

        {/* Quick Connection Card */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Server size={14} /> Connection URI for MongoDB Compass
            </span>
            <button
              onClick={copyUri}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-mono transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy URI'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-emerald-900/60 font-mono text-emerald-300 text-sm flex items-center justify-between select-all">
            <code>mongodb://127.0.0.1:27017</code>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Database Name:</span>
            <code className="text-cyan-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              testers_home
            </code>
          </div>
        </div>

        {/* How to Connect steps */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider">
            How to open in MongoDB Compass:
          </h4>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
            <li>Open the <strong className="text-emerald-300">MongoDB Compass</strong> app on your computer.</li>
            <li>Paste <code className="text-emerald-400 font-mono">mongodb://127.0.0.1:27017</code> in the connection string box.</li>
            <li>Click <strong className="text-cyan-300">Connect</strong>.</li>
            <li>In the left sidebar, click database <code className="text-cyan-400 font-mono">testers_home</code> to view all collections.</li>
          </ol>
        </div>

        {/* Live Database Collections Inspector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-2">
              <Layers size={14} /> Live Collections in MongoDB
            </h4>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: 'bugs', desc: 'Tickets & lifecycle' },
              { name: 'testcases', desc: 'Pre-conditions & steps' },
              { name: 'testsuites', desc: 'Suites hierarchy' },
              { name: 'testruns', desc: 'Execution passes & fails' },
              { name: 'projects', desc: 'Workspaces & health scores' },
              { name: 'users', desc: 'QA testers & Dev logins' },
              { name: 'activitylogs', desc: 'Realtime event feed' },
              { name: 'comments', desc: 'Inline code discussions' },
              { name: 'workspaces', desc: 'Team collaborative hubs' },
            ].map(col => (
              <div
                key={col.name}
                className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-xs flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Database size={12} className="text-emerald-400" />
                  <span>{col.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">{col.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Server Status */}
        {healthData && (
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Server: {healthData.appName} v{healthData.version}</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected to 127.0.0.1:27017
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

