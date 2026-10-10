import React from 'react';
import { SeverityBadge, StatusBadge } from '../ui/NeonBadge';
import { ListOrdered, Bug, ChevronRight } from 'lucide-react';

export const TestCaseCard = ({ testCase, onClick }) => {
  return (
    <div
      onClick={() => onClick(testCase)}
      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 group"
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="font-mono text-xs font-bold text-emerald-400 group-hover:text-emerald-300 shrink-0 mt-0.5">
          {testCase.key}
        </span>
        <div className="min-w-0 space-y-1">
          <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-white">
            {testCase.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <ListOrdered size={12} /> {testCase.steps?.length || 0} steps
            </span>
            {testCase.linkedBugs?.length > 0 && (
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <Bug size={11} /> {testCase.linkedBugs.length} bug(s)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <SeverityBadge severity={testCase.severity} />
        <StatusBadge status={testCase.lastExecutionStatus} />
        <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
      </div>
    </div>
  );
};

