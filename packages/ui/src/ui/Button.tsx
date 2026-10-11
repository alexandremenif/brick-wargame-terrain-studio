import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'active';
  size?: 'sm' | 'md' | 'icon';
  shortcut?: string;
}

export function Button({
  variant = 'default',
  size = 'md',
  shortcut,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    icon: 'p-1.5 h-8 w-8 text-xs'
  }[size];

  const variantClasses = {
    default: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700',
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm',
    ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
    active: 'bg-blue-600 text-white border border-blue-500 shadow-sm'
  }[variant];

  return (
    <button
      type="button"
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
      {shortcut && (
        <span className="absolute bottom-0.5 right-1 text-[9px] text-zinc-400 font-mono select-none">
          {shortcut}
        </span>
      )}
    </button>
  );
}
