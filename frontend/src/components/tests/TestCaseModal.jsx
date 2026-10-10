import React, { useState } from 'react';
import { CheckSquare, ListOrdered, Bug, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SeverityBadge, StatusBadge } from '../ui/NeonBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TestCaseModal = ({ isOpen, onClose, testCase, onUpdateCase }) => {
  if (!isOpen || !testCase) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`[${testCase.key}] Test Case Specification`} maxWidth="max-w-3xl">
      <div className="space-y-5">
        {/* Title & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={testCase.severity} />
              <StatusBadge status={testCase.lastExecutionStatus} />
              <span className="text-xs font-mono text-slate-400">
                Suite: {testCase.suite?.title || 'General'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{testCase.title}</h3>
          </div>
        </div>

        {/* Pre-conditions */}
        {testCase.preconditions && (
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Pre-conditions
            </span>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{testCase.preconditions}</p>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div>
          <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider mb-2 flex items-center gap-1.5">
            <ListOrdered size={14} /> Step-by-Step Execution Sequence
          </h4>
          <div className="space-y-2">
            {testCase.steps?.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 flex items-start gap-3 text-xs"
              >
                <span className="h-5 w-5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {step.stepNumber || idx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="text-slate-200 font-medium">{step.action}</div>
                  <div className="text-emerald-400 text-[11px] font-mono">
                    ↳ Expected: {step.expectedOutcome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expected Outcome */}
        <div className="p-3.5 rounded-xl border border-emerald-950 bg-emerald-950/20 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} /> Expected Outcome
          </span>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {testCase.expectedOutcome}
          </p>
        </div>

        {/* Test Data */}
        {testCase.testData && (
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-1 font-mono">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
              Test Data / Payload Parameters
            </span>
            <pre className="text-xs text-cyan-300 overflow-x-auto">{testCase.testData}</pre>
          </div>
        )}

        {/* Linked Bugs */}
        {testCase.linkedBugs?.length > 0 && (
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider mb-1.5 block">
              Linked Bugs Logged Against this Case
            </span>
            <div className="flex flex-wrap gap-2">
              {testCase.linkedBugs.map((b) => (
                <div key={b._id || b} className="px-2.5 py-1 rounded bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs font-mono flex items-center gap-1.5">
                  <Bug size={12} />
                  <span>{b.key || 'Linked Defect'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

