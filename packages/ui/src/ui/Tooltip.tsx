import React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5'
  }[position];

  return (
    <div className="group relative inline-flex items-center justify-center">
      {children}
      <div
        className={`pointer-events-none absolute ${positionClasses} hidden rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-xs text-zinc-200 shadow-xl whitespace-nowrap group-hover:block z-50`}
      >
        {content}
      </div>
    </div>
  );
}
