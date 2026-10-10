import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Wand2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AIPolishModal = ({ isOpen, onClose, initialData = {}, onApplyPolished }) => {
  const [rawTitle, setRawTitle] = useState(initialData.title || '');
  const [rawSteps, setRawSteps] = useState(initialData.reproductionSteps || '');
  const [rawLogs, setRawLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToast } = useToast();

  const handlePolish = async () => {
    setLoading(true);
    try {
      const data = await api.polishReport({
        rawTitle,
        rawSteps,
        rawLogs,
        rawExpected: initialData.expectedBehavior,
        rawActual: initialData.actualBehavior,
        environment: initialData.environment,
      });
      setResult(data);
      addToast('AI Polish generated formatted QA structure!', 'cyber');
    } catch (err) {
      addToast(err.message || 'AI Polish failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyPolished({
        title: result.polishedTitle,
        reproductionSteps: result.reproductionSteps,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ AI Bug Report Polish Assistant" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          Paste unstructured tester notes or console logs. The AI polish engine refines them into clean, numbered reproduction steps and structured markdown.
        </p>

        {!result ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Bug Summary / Quick Notes
              </label>
              <input
                type="text"
                value={rawTitle}
                onChange={(e) => setRawTitle(e.target.value)}
                placeholder="e.g. video crashed when recorded for long"
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Raw Reproduction Notes (Messy text, bullet points)
              </label>
              <textarea
                rows={4}
                value={rawSteps}
                onChange={(e) => setRawSteps(e.target.value)}
                placeholder="clicked button then opened screen share chose chrome tab and after like 1 min tab went blank..."
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Optional Raw Console Stack Trace / JSON Payload
              </label>
              <textarea
                rows={3}
                value={rawLogs}
                onChange={(e) => setRawLogs(e.target.value)}
                placeholder='Uncaught RangeError: Maximum call stack size exceeded at Array.push (<anonymous>)...'
                className="w-full glass-input font-mono text-[11px] text-amber-300"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handlePolish}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all"
              >
                <Sparkles size={15} />
                <span>{loading ? 'Analyzing & Structuring...' : 'Polish Bug Report'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Polished Title:</span>
                <div className="text-sm font-bold text-slate-100">{result.polishedTitle}</div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Structured Steps:</span>
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-slate-950/80 p-3 rounded-lg border border-slate-800 mt-1">
                  {result.reproductionSteps}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setResult(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Edit input notes
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                <Check size={15} />
                <span>Apply to Bug Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

