import React, { useState } from 'react';
import { 
  Bug, 
  Sparkles, 
  Video, 
  Paperclip, 
  Laptop, 
  Flame, 
  AlertTriangle, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AIPolishModal } from './AIPolishModal';
import { ScreenRecorderModal } from '../ui/ScreenRecorderModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const BugCreateModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  onBugCreated,
  initialData = {} 
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [severity, setSeverity] = useState(initialData.severity || 'Medium');
  const [priority, setPriority] = useState(initialData.priority || 'P2');
  const [reproductionSteps, setReproductionSteps] = useState(
    initialData.reproductionSteps || '1. Navigate to target screen\n2. Perform action\n3. Observe unexpected anomaly'
  );
  const [expectedBehavior, setExpectedBehavior] = useState(initialData.expectedBehavior || '');
  const [actualBehavior, setActualBehavior] = useState(initialData.actualBehavior || '');
  const [os, setOs] = useState('Windows 11');
  const [browser, setBrowser] = useState('Chrome 128');
  const [device, setDevice] = useState('Desktop');
  const [buildVersion, setBuildVersion] = useState('v1.4.2-staging');

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedVideoUrl, setAttachedVideoUrl] = useState(null);

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const handleAttachRecorderClip = (file, url) => {
    setAttachedFiles(prev => [...prev, file]);
    setAttachedVideoUrl(url);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleApplyPolished = (polished) => {
    setTitle(polished.title);
    setReproductionSteps(polished.reproductionSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter a descriptive bug title', 'error');
      return;
    }

    setLoading(true);
    try {
      const newBug = await api.createBug({
        title,
        projectId,
        severity,
        priority,
        environment: { os, browser, device, buildVersion },
        reproductionSteps,
        expectedBehavior,
        actualBehavior,
        linkedTestCaseId: initialData.linkedTestCaseId || undefined,
      });

      // Upload any attachments if present
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        attachedFiles.forEach(file => formData.append('files', file));
        await api.uploadBugAttachments(newBug._id, formData);
      }

      addToast(`Bug [${newBug.key}] logged successfully!`, 'success');
      if (onBugCreated) onBugCreated(newBug);
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to create bug', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="🐞 Report & Log Defect" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              Empower reports with AI structuring & instant screen recording:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 hover:from-cyan-600/50 hover:to-indigo-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition-all"
              >
                <Sparkles size={13} />
                <span>AI Polish Steps</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRecorderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold transition-all"
              >
                <Video size={13} />
                <span>Record Screen</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Bug Title / Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Memory leak during video stream recording..."
              className="w-full glass-input font-medium"
            />
          </div>

          {/* Severity & Priority */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="Critical" className="bg-slate-900">Critical (Blocker)</option>
                <option value="High" className="bg-slate-900">High</option>
                <option value="Medium" className="bg-slate-900">Medium</option>
                <option value="Low" className="bg-slate-900">Low (Minor)</option>
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
                <option value="P4" className="bg-slate-900">P4 (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Browser / Engine</label>
              <input
                type="text"
                value={browser}
                onChange={(e) => setBrowser(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Build / Release</label>
              <input
                type="text"
                value={buildVersion}
                onChange={(e) => setBuildVersion(e.target.value)}
                className="w-full glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Side-by-side Expected vs Actual Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle size={13} /> Expected Behavior
              </label>
              <textarea
                rows={3}
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="What should normally happen according to specification..."
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-rose-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Actual Behavior
              </label>
              <textarea
                rows={3}
                value={actualBehavior}
                onChange={(e) => setActualBehavior(e.target.value)}
                placeholder="What actually occurred, errors displayed, or unexpected state..."
                className="w-full glass-input text-xs"
              />
            </div>
          </div>

          {/* Reproduction Steps */}
          <div>
            <label className="block text-xs font-mono uppercase text-cyan-400 mb-1">
              Reproduction Steps (Numbered Sequence)
            </label>
            <textarea
              rows={4}
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              className="w-full glass-input font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Media Attachments (Logs, Screenshots, Recorded Clips)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
              />
              {attachedFiles.length > 0 && (
                <span className="text-xs font-mono text-cyan-400">
                  {attachedFiles.length} file(s) attached
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-950/50"
            >
              {loading ? 'Submitting...' : 'Log Bug Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Embedded AI Polish Modal */}
      <AIPolishModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialData={{
          title,
          reproductionSteps,
          expectedBehavior,
          actualBehavior,
          environment: { os, browser, device, buildVersion }
        }}
        onApplyPolished={handleApplyPolished}
      />

      {/* Embedded Screen Recorder Modal */}
      <ScreenRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onAttachClip={handleAttachRecorderClip}
      />
    </>
  );
};

