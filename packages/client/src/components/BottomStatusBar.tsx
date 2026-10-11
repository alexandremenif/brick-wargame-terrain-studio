import React from 'react';

export interface BottomStatusBarProps {
  cursorX?: number;
  cursorY?: number;
  connected?: boolean;
}

export function BottomStatusBar({
  cursorX = 0,
  cursorY = 0,
  connected = true
}: BottomStatusBarProps) {
  const cursorCmX = (cursorX * 0.8).toFixed(1);
  const cursorCmY = (cursorY * 0.8).toFixed(1);

  return (
    <footer className="h-7 border-t border-zinc-800 bg-zinc-900 px-3 flex items-center justify-between text-[11px] font-mono select-none">
      <div className="flex items-center gap-4">
        <span className="text-zinc-400">
          Cursor: <span className="text-zinc-200">[{cursorX}, {cursorY}]</span> ({cursorCmX} cm × {cursorCmY} cm)
        </span>
        <span className="text-zinc-500">|</span>
        <span className="text-zinc-400">
          Scale 1:1 (1 stud = 8 mm)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'}`} />
        <span className={connected ? 'text-zinc-300' : 'text-amber-400'}>
          {connected ? 'Local Engine Connected' : 'Reconnecting...'}
        </span>
      </div>
    </footer>
  );
}
