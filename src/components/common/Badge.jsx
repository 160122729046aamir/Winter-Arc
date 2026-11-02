import React from 'react';

export default function Badge({
  children,
  variant = 'indigo',
  size = 'sm',
  className = ''
}) {
  const variantClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    slate: 'bg-slate-700/30 text-slate-400 border-slate-700/50'
  }[variant] || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  }[size] || 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}

