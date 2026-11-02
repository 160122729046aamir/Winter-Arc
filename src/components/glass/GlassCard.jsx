import React from 'react';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) {
  return (
    <div
      className={`glass-card p-5 sm:p-6 rounded-2xl ${
        hoverEffect ? 'hover:translate-y-[-2px]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

