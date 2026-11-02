import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'indigo',
  showLabel = false,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size] || 'h-2.5';

  const colorClasses = {
    indigo: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    violet: 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
  }[color] || 'bg-indigo-500';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="text-slate-200 font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden ${sizeClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

