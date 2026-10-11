import React from 'react';
import { Button } from '../ui/Button.js';
import { UndoIcon, RedoIcon, GridIcon } from '../ui/icons/Icons.js';
import { Tooltip } from '../ui/Tooltip.js';

export interface TopHeaderBarProps {
  gridVisible: boolean;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function TopHeaderBar({
  gridVisible,
  onToggleGrid,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: TopHeaderBarProps) {
  return (
    <header className="h-12 border-b border-zinc-800 bg-zinc-900 px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-sm tracking-wide text-zinc-100">
          LEGO Wargame Terrain Studio
        </h1>
        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
          95 × 180 cm (118 × 225 studs)
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Tooltip content="Undo (Ctrl+Z)">
          <Button size="icon" variant="ghost" disabled={!canUndo} onClick={onUndo}>
            <UndoIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Y)">
          <Button size="icon" variant="ghost" disabled={!canRedo} onClick={onRedo}>
            <RedoIcon />
          </Button>
        </Tooltip>
        <div className="h-4 w-px bg-zinc-800 mx-1" />
        <Tooltip content="Toggle 1px reference grid (G)">
          <Button
            size="icon"
            variant={gridVisible ? 'active' : 'ghost'}
            onClick={onToggleGrid}
          >
            <GridIcon />
          </Button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="default">
          Export ▾
        </Button>
      </div>
    </header>
  );
}
