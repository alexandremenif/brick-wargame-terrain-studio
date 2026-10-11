import React from 'react';
import type { BrickColor } from '@lego-wargame-terrain-studio/api';

export type ToolMode = 'Brush' | 'Eraser';
export type BrushSize = '1x1' | '2x2' | '4x4' | '8x8' | '16x16' | '32x32';

export interface LeftToolboxSidebarProps {
  toolMode: ToolMode;
  brushSize: BrushSize;
  selectedColorId: number;
  colors: BrickColor[];
  onSelectToolMode: (mode: ToolMode) => void;
  onSelectBrushSize: (size: BrushSize) => void;
  onSelectColor: (colorId: number) => void;
}

const BRUSH_SIZES: BrushSize[] = ['1x1', '2x2', '4x4', '8x8', '16x16', '32x32'];

export const LeftToolboxSidebar: React.FC<LeftToolboxSidebarProps> = ({
  toolMode,
  brushSize,
  selectedColorId,
  colors,
  onSelectToolMode,
  onSelectBrushSize,
  onSelectColor,
}) => {
  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100 select-none">
      {/* Tool Mode Buttons */}
      <div className="p-3 border-b border-zinc-800">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Tool Mode
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            data-testid="tool-brush-btn"
            onClick={() => onSelectToolMode('Brush')}
            className={`flex items-center justify-center gap-1.5 rounded border py-1.5 text-xs font-medium transition-colors ${
              toolMode === 'Brush'
                ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🖌</span>
            <span>Brush</span>
          </button>
          <button
            type="button"
            data-testid="tool-eraser-btn"
            onClick={() => onSelectToolMode('Eraser')}
            className={`flex items-center justify-center gap-1.5 rounded border py-1.5 text-xs font-medium transition-colors ${
              toolMode === 'Eraser'
                ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🧹</span>
            <span>Eraser</span>
          </button>
        </div>
      </div>

      {/* Brush Size Presets */}
      <div className="p-3 border-b border-zinc-800">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Brush Size
        </label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              data-testid={`brush-size-${size}`}
              onClick={() => onSelectBrushSize(size)}
              className={`rounded border py-1 text-xs font-medium transition-colors ${
                brushSize === size
                  ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 41 Color Swatches */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Official Colors ({colors.length})
          </label>
          {toolMode === 'Eraser' && (
            <span className="text-[10px] text-zinc-400 italic">(Disabled in Eraser)</span>
          )}
        </div>

        <div className={`mt-2 grid grid-cols-6 gap-1.5 ${toolMode === 'Eraser' ? 'opacity-40 pointer-events-none' : ''}`}>
          {colors.map((color) => {
            const isSelected = selectedColorId === color.id && toolMode === 'Brush';
            return (
              <button
                key={color.id}
                type="button"
                data-testid={`color-swatch-${color.name}`}
                data-color-id={color.id}
                data-color-name={color.name}
                data-color-hex={color.hex}
                title={`${color.name} (#${color.id})`}
                onClick={() => onSelectColor(color.id)}
                className={`relative aspect-square w-full rounded-sm border transition-all ${
                  isSelected
                    ? 'border-white ring-2 ring-white scale-105 z-10'
                    : 'border-black/40 hover:scale-105 hover:border-zinc-400'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
};
