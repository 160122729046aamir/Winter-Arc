import React from 'react';

// Glass skeleton that mirrors a typical page layout while a route chunk loads.
export default function PageLoader() {
  const block = 'rounded-2xl glass-ultra relative overflow-hidden';
  const sheen =
    'absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.07)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer';

  return (
    <div className="space-y-6 animate-fadeIn" aria-busy="true" aria-label="Loading view">
      <div className={`${block} h-28`}><div className={sheen} /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-24`}><div className={sheen} /></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`${block} h-64 lg:col-span-2`}><div className={sheen} /></div>
        <div className={`${block} h-64`}><div className={sheen} /></div>
      </div>
    </div>
  );
}
