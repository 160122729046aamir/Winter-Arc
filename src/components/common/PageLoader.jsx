import React from 'react';

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4 animate-fadeIn">
      {/* Apple-style spinning indicator */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyan-400 border-r-indigo-500 animate-spin" />
      </div>
      <p className="text-xs font-mono text-slate-400 tracking-wider uppercase">
        Loading view...
      </p>
    </div>
  );
}

