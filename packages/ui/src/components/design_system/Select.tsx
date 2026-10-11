import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({
  className = '',
  disabled,
  children,
  ...props
}: SelectProps) {
  const baseClasses =
    'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs outline-none cursor-pointer transition-colors hover:border-zinc-700 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  return (
    <select
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
