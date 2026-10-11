import React from 'react';
import { Button } from '../ui/Button.js';
import { BrushIcon, EraserIcon, SelectIcon } from '../ui/icons/Icons.js';
import { Tooltip } from '../ui/Tooltip.js';

export type ToolType = 'brush' | 'eraser' | 'select';

export interface LeftToolboxSidebarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  brushSize: number;
  onSelectBrushSize: (size: number) => void;
  selectedColorId: number;
  onSelectColor: (colorId: number) => void;
}

const BRUSH_SIZES = [1, 2, 4, 8, 16, 32];

// Basic sample official LEGO colors for initial setup
const SAMPLE_LEGO_COLORS = [
  { id: 28, name: 'Dark Green', hex: '#184632' },
  { id: 37, name: 'Bright Green', hex: '#4B9F4A' },
  { id: 119, name: 'Lime', hex: '#A5CA18' },
  { id: 138, name: 'Dark Tan', hex: '#958A73' },
  { id: 86, name: 'Dark Stone Grey', hex: '#635F61' },
  { id: 194, name: 'Medium Stone Grey', hex: '#9C9291' },
  { id: 102, name: 'Medium Blue', hex: '#5A93DB' },
  { id: 192, name: 'Reddish Brown', hex: '#582A12' }
];

export function LeftToolboxSidebar({
  activeTool,
  onSelectTool,
  brushSize,
  onSelectBrushSize,
  selectedColorId,
  onSelectColor
}: LeftToolboxSidebarProps) {
  return (
    <aside className="w-60 border-r border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-4 select-none">
      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Tools
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          <Tooltip content="Brush Tool (B)">
            <Button
              size="icon"
              variant={activeTool === 'brush' ? 'active' : 'default'}
              onClick={() => onSelectTool('brush')}
            >
              <BrushIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Eraser Tool (E)">
            <Button
              size="icon"
              variant={activeTool === 'eraser' ? 'active' : 'default'}
              onClick={() => onSelectTool('eraser')}
            >
              <EraserIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Select Tool (S)">
            <Button
              size="icon"
              variant={activeTool === 'select' ? 'active' : 'default'}
              onClick={() => onSelectTool('select')}
            >
              <SelectIcon />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Brush Size (Studs)
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {BRUSH_SIZES.map((size) => (
            <Button
              key={size}
              size="sm"
              variant={brushSize === size ? 'active' : 'default'}
              onClick={() => onSelectBrushSize(size)}
            >
              {size}×{size}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Official LEGO Palette
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {SAMPLE_LEGO_COLORS.map((color) => {
            const isSelected = selectedColorId === color.id;
            return (
              <Tooltip key={color.id} content={`${color.name} (ID: ${color.id})`}>
                <button
                  type="button"
                  onClick={() => onSelectColor(color.id)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 rounded border transition-transform hover:scale-110 focus:outline-none ${
                    isSelected ? 'border-white ring-2 ring-blue-500 scale-105' : 'border-zinc-700/60'
                  }`}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
