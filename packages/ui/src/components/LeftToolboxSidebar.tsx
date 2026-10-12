import React from 'react';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';
import { Button, Tooltip } from './design_system/index.js';

export type ToolMode = 'Brush' | 'Eraser' | 'Pan';
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
  const isColorDisabled = toolMode === 'Eraser' || toolMode === 'Pan';

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100 select-none">
      {/* Tool Mode Buttons */}
      <div className="p-3 border-b border-zinc-800">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Tool Mode
        </label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Button
            data-testid="tool-brush-btn"
            variant="secondary"
            size="sm"
            isActive={toolMode === 'Brush'}
            onClick={() => onSelectToolMode('Brush')}
            className="flex items-center gap-1"
          >
            <span>🖌</span>
            <span>Brush</span>
          </Button>

          <Button
            data-testid="tool-eraser-btn"
            variant="secondary"
            size="sm"
            isActive={toolMode === 'Eraser'}
            onClick={() => onSelectToolMode('Eraser')}
            className="flex items-center gap-1"
          >
            <span>🧹</span>
            <span>Eraser</span>
          </Button>

          <Button
            data-testid="tool-pan-btn"
            variant="secondary"
            size="sm"
            isActive={toolMode === 'Pan'}
            onClick={() => onSelectToolMode('Pan')}
            className="flex items-center gap-1"
          >
            <span>✋</span>
            <span>Pan</span>
          </Button>
        </div>
      </div>

      {/* Brush Size Presets */}
      <div className="p-3 border-b border-zinc-800">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Brush Size
        </label>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {BRUSH_SIZES.map((size) => (
            <Button
              key={size}
              data-testid={`brush-size-${size}`}
              variant="secondary"
              size="xs"
              isActive={brushSize === size}
              onClick={() => onSelectBrushSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* 41 Color Swatches */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Official Colors ({colors.length})
          </label>
          {isColorDisabled && (
            <span className="text-[10px] text-zinc-400 italic">
              (Disabled in {toolMode})
            </span>
          )}
        </div>

        <div
          className={`mt-2 grid grid-cols-6 gap-1.5 ${
            isColorDisabled ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {colors.map((color) => {
            const isSelected = selectedColorId === color.id && toolMode === 'Brush';
            return (
              <Tooltip
                key={color.id}
                content={`${color.name} (${color.hex})`}
                position="top"
              >
                <button
                  type="button"
                  data-testid={`color-swatch-${color.name}`}
                  data-color-id={color.id}
                  data-color-name={color.name}
                  data-color-hex={color.hex}
                  onClick={() => onSelectColor(color.id)}
                  className={`relative aspect-square w-full rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white ring-2 ring-white scale-105 z-10'
                      : 'border-black/40 hover:scale-105 hover:border-zinc-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
