import React from 'react';

export const NeonBadge = ({ children, variant = 'cyan', size = 'sm', dot = true, className = '' }) => {
  const variantStyles = {
    cyan: {
      badge: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
      dot: 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]',
    },
    emerald: {
      badge: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
    },
    purple: {
      badge: 'bg-purple-950/80 text-purple-200 border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
      dot: 'bg-purple-400 shadow-[0_0_8px_#8b5cf6]',
    },
    indigo: {
      badge: 'bg-indigo-950/80 text-indigo-200 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
      dot: 'bg-indigo-400 shadow-[0_0_8px_#6366f1]',
    },
    crimson: {
      badge: 'bg-rose-950/80 text-rose-200 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      dot: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    },
    amber: {
      badge: 'bg-amber-950/80 text-amber-200 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
    },
    slate: {
      badge: 'bg-slate-800/90 text-slate-200 border-slate-700/80',
      dot: 'bg-slate-400',
    },
  };

  const sizeStyles = {
    xs: 'text-xs px-2.5 py-0.5',
    sm: 'text-xs px-3 py-1 font-medium',
    md: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  const style = variantStyles[variant] || variantStyles.slate;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-sans font-medium select-none ${style.badge} ${sizeStyles[size] || sizeStyles.sm} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />}
      <span>{children}</span>
    </span>
  );
};

export const SeverityBadge = ({ severity }) => {
  const map = {
    Critical: 'crimson',
    High: 'amber',
    Medium: 'cyan',
    Low: 'emerald',
  };
  return <NeonBadge variant={map[severity] || 'slate'} size="xs">{severity}</NeonBadge>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    'Draft': 'slate',
    'Open': 'amber',
    'In Progress': 'purple',
    'Ready for QA': 'cyan',
    'Verified & Closed': 'emerald',
    'Reopened': 'crimson',
    'Pass': 'emerald',
    'Fail': 'crimson',
    'Blocked': 'amber',
    'Skipped': 'slate',
  };
  return <NeonBadge variant={map[status] || 'slate'} size="xs">{status}</NeonBadge>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    P1: 'crimson',
    P2: 'amber',
    P3: 'cyan',
    P4: 'slate',
  };
  return <NeonBadge variant={map[priority] || 'slate'} size="xs">{priority || 'P2'}</NeonBadge>;
};
