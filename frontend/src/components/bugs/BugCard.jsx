import React from 'react';
import { SeverityBadge, StatusBadge } from '../ui/NeonBadge';
import { User, Paperclip, MessageSquare } from 'lucide-react';

export const BugCard = ({ bug, onClick }) => {
  const isCritical = bug.severity === 'Critical';

  return (
    <div
      onClick={() => onClick(bug)}
      className={`group p-4 rounded-2xl border bg-slate-900/80 backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
        isCritical
          ? 'border-rose-800/60 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]'
          : 'border-slate-700/80 hover:border-slate-500 hover:shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
          {bug.key}
        </span>
        <div className="flex items-center gap-1.5">
          <SeverityBadge severity={bug.severity} />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-3.5 leading-snug group-hover:text-white transition-colors">
        {bug.title}
      </h4>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          {bug.attachments?.length > 0 && (
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Paperclip size={12} /> {bug.attachments.length}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-xs font-medium text-slate-300 border border-slate-700">
            {bug.priority}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {bug.assignee ? (
            <span className="text-xs text-purple-300 font-semibold truncate max-w-[110px]">
              {bug.assignee.name}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
