import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'indigo',
  badge
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      hover: 'hover:border-indigo-500/40'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      hover: 'hover:border-cyan-500/40'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      hover: 'hover:border-emerald-500/40'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      hover: 'hover:border-amber-500/40'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      hover: 'hover:border-rose-500/40'
    }
  }[color] || {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    hover: 'hover:border-indigo-500/40'
  };

  return (
    <div
      className={`arc-card p-4 sm:p-5 transition-all ${colorMap.hover}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorMap.bg} ${colorMap.border} border ${colorMap.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {value}
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}

