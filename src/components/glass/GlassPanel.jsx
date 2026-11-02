import React from 'react';

export default function GlassPanel({
  children,
  level = 'panel', // 'ultra' | 'thin' | 'panel' | 'card'
  className = '',
  style = {},
  ...props
}) {
  const levelClass = {
    ultra: 'glass-ultra',
    thin: 'glass-thin',
    panel: 'glass-panel',
    card: 'glass-card'
  }[level] || 'glass-panel';

  return (
    <div
      className={`${levelClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

