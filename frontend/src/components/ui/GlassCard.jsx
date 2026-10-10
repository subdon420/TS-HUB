import React from 'react';

export const GlassCard = ({ children, className = '', hover = true, glow = 'none', onClick }) => {
  const glowStyles = {
    none: '',
    cyan: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] hover:border-cyan-500/40',
    purple: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.18)] hover:border-purple-500/40',
    emerald: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] hover:border-emerald-500/40',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-xl p-5 transition-all duration-300 ${
        hover ? 'hover:border-slate-700/90 hover:bg-slate-900/80' : ''
      } ${glowStyles[glow] || ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

