import React from 'react';

export type BadgeVariant = 'neutral' | 'accent' | 'subtle';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center select-none';

  const variantClasses: Record<BadgeVariant, string> = {
    neutral: 'bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 font-mono text-[11px] px-2 py-0.5 rounded',
    accent: 'bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] px-2 py-0.5 rounded font-medium',
    subtle: 'bg-zinc-900 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
