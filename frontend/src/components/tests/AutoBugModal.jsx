import React, { useState } from 'react';
import { AlertCircle, Bug, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const AutoBugModal = ({ isOpen, onClose, contextData, onConfirm }) => {
  if (!isOpen || !contextData) return null;

  const { testCase, notes } = contextData;

  const [title, setTitle] = useState(`[FAILED TC] ${testCase?.title || 'Execution Failure'}`);
  const [severity, setSeverity] = useState('High');
  const [priority, setPriority] = useState('P1');
  const [description, setDescription] = useState(
    notes || `Automated defect ticket generated when test case ${testCase?.key} failed step assertion.`
  );

  const handleConfirm = () => {
    onConfirm({
      title,
      severity,
      priority,
      description,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🚨 Auto-Log Bug on Test Case Failure" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl border border-rose-950 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
          <p>
            You marked test case <strong className="text-rose-200 font-mono">[{testCase?.key}]</strong> as <strong className="text-white">FAIL</strong>. 
            A pre-populated bug ticket will be opened and linked automatically.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Bug Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="Critical" className="bg-slate-900">Critical</option>
                <option value="High" className="bg-slate-900">High</option>
                <option value="Medium" className="bg-slate-900">Medium</option>
                <option value="Low" className="bg-slate-900">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="P1" className="bg-slate-900">P1 (Immediate)</option>
                <option value="P2" className="bg-slate-900">P2 (High)</option>
                <option value="P3" className="bg-slate-900">P3 (Medium)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Failure Details & Observed Assertion
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-950/50"
          >
            <Bug size={14} /> Log Bug & Mark Fail
          </button>
        </div>
      </div>
    </Modal>
  );
};

