import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ShieldCheck, Bug, CheckSquare, Users, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';

export const ProjectCard = ({ project, onClick }) => {
  const stats = project.stats || {};
  const health = project.healthScore || 90;

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    if (score >= 70) return 'text-amber-300 border-amber-500/50 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
    return 'text-rose-300 border-rose-500/50 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
  };

  return (
    <GlassCard onClick={() => onClick(project)} hover={true} glow="cyan" className="group p-6 rounded-3xl border-slate-700/80 hover:border-cyan-500/60 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm">
              {project.key}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize border border-slate-700">
              {project.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors pt-1">
            {project.name}
          </h3>
        </div>

        {/* Health Score Gauge */}
        <div className={`px-3.5 py-2 rounded-2xl border font-bold text-xs flex flex-col items-center shrink-0 ${getHealthColor(health)}`}>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Health</span>
          <span className="text-base font-black">{health}%</span>
        </div>
      </div>

      <p className="text-sm text-slate-300 line-clamp-2 mb-5 leading-relaxed font-normal">
        {project.description || 'Enterprise software project repository.'}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 text-center">
        <div>
          <span className="text-xs font-medium text-slate-400 block">Open Bugs</span>
          <span className={`text-sm font-black ${stats.openBugsCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {stats.openBugsCount || 0}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block">Test Suites</span>
          <span className="text-sm font-black text-slate-200">
            {stats.totalSuites || 0}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block">Pass Rate</span>
          <span className="text-sm font-black text-emerald-400">
            {stats.completionRate || 0}%
          </span>
        </div>
      </div>

      {/* Severity Breakdown Ticker */}
      <div className="flex items-center justify-between text-xs text-slate-300 mb-4 px-1">
        <span className="text-slate-400 font-medium">Active Severity:</span>
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-rose-400 font-bold">{stats.criticalBugs || 0} Crit</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-bold">{stats.highBugs || 0} High</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400">{stats.mediumBugs || 0} Med</span>
        </div>
      </div>

      {/* Footer: Contributors & Action */}
      <div className="flex items-center justify-between pt-3.5 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center -space-x-2">
          {project.members?.slice(0, 3).map((m, idx) => (
            <img
              key={idx}
              src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${idx}`}
              alt={m.name}
              className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 object-cover"
            />
          ))}
          {project.members?.length > 3 && (
            <span className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 text-xs font-bold flex items-center justify-center text-slate-300">
              +{project.members.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs group-hover:translate-x-1 transition-transform">
          <span>Open Workspace</span>
          <ArrowUpRight size={15} />
        </div>
      </div>
    </GlassCard>
  );
};
