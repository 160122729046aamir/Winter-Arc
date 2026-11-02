import React from 'react';

export default function GlassButton({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  className = '',
  disabled = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3 text-sm font-bold rounded-2xl gap-2.5'
  }[size] || 'px-4 py-2 text-xs font-semibold rounded-xl gap-2';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30',
    secondary:
      'glass-ultra text-slate-100 hover:bg-white/10 border border-white/10 shadow-sm',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]',
    danger:
      'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 shadow-sm'
  }[variant] || 'glass-ultra text-slate-100 border border-white/10';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium apple-press disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
}

