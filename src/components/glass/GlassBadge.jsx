import React from 'react';

export default function GlassBadge({
  children,
  color = 'indigo', // 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'
  size = 'sm',
  className = ''
}) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    slate: 'bg-white/[0.05] text-slate-300 border-white/10'
  }[color] || 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25';

  const sizeMap = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  }[size] || 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border backdrop-blur-md font-mono ${colorMap} ${sizeMap} ${className}`}
    >
      {children}
    </span>
  );
}

