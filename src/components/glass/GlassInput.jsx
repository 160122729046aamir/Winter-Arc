import React from 'react';

export default function GlassInput({
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      <input
        className={`w-full py-2.5 bg-black/25 text-slate-100 placeholder-slate-500 rounded-xl border border-white/10 text-xs sm:text-sm backdrop-blur-md focus:outline-none focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/20 transition-all ${
          Icon ? 'pl-10 pr-4' : 'px-4'
        }`}
        {...props}
      />
    </div>
  );
}

