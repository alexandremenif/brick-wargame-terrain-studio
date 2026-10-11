import React from 'react';
import { NumberInput } from '../ui/NumberInput.js';

export interface BoundingBoxState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RightInspectorSidebarProps {
  bbox: BoundingBoxState;
  onChangeBBox: (bbox: BoundingBoxState) => void;
}

export function RightInspectorSidebar({ bbox, onChangeBBox }: RightInspectorSidebarProps) {
  // Physical scale: 1 stud = 0.8 cm (8 mm)
  const widthCm = (bbox.width * 0.8).toFixed(1);
  const heightCm = (bbox.height * 0.8).toFixed(1);

  return (
    <aside className="w-64 border-l border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-4 select-none">
      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Bounding Box Selection
        </h3>
        <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 space-y-2">
          <div className="text-[11px] font-mono text-zinc-400 mb-2 flex justify-between">
            <span>Size:</span>
            <span className="text-zinc-200">
              {widthCm} × {heightCm} cm
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="X"
              value={bbox.x}
              unit="st"
              min={0}
              max={118}
              onChange={(val) => onChangeBBox({ ...bbox, x: val })}
            />
            <NumberInput
              label="Y"
              value={bbox.y}
              unit="st"
              min={0}
              max={225}
              onChange={(val) => onChangeBBox({ ...bbox, y: val })}
            />
            <NumberInput
              label="W"
              value={bbox.width}
              unit="st"
              min={1}
              max={118}
              onChange={(val) => onChangeBBox({ ...bbox, width: val })}
            />
            <NumberInput
              label="H"
              value={bbox.height}
              unit="st"
              min={1}
              max={225}
              onChange={(val) => onChangeBBox({ ...bbox, height: val })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Preset Library
        </h3>
        <div className="p-3 bg-zinc-950 rounded border border-dashed border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">No saved presets yet</p>
        </div>
      </div>
    </aside>
  );
}
