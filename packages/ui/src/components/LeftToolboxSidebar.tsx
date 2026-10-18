import React from 'react';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';

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
    <aside className="studio-sidebar studio-sidebar-left wa-stack" data-testid="left-toolbox-sidebar">
      {/* Tool Mode Buttons */}
      <div className="studio-sidebar-section wa-stack" style={{ gap: 'var(--wa-space-2xs)' }}>
        <span className="studio-section-label">Tool Mode</span>
        <div className="studio-grid-3col">
          <wa-button
            data-testid="tool-brush-btn"
            variant={toolMode === 'Brush' ? 'brand' : 'neutral'}
            size="small"
            data-active={toolMode === 'Brush'}
            className={toolMode === 'Brush' ? 'border-amber-500' : ''}
            onClick={() => onSelectToolMode('Brush')}
          >
            🖌 Brush
          </wa-button>

          <wa-button
            data-testid="tool-eraser-btn"
            variant={toolMode === 'Eraser' ? 'brand' : 'neutral'}
            size="small"
            data-active={toolMode === 'Eraser'}
            className={toolMode === 'Eraser' ? 'border-amber-500' : ''}
            onClick={() => onSelectToolMode('Eraser')}
          >
            🧹 Eraser
          </wa-button>

          <wa-button
            data-testid="tool-pan-btn"
            variant={toolMode === 'Pan' ? 'brand' : 'neutral'}
            size="small"
            data-active={toolMode === 'Pan'}
            className={toolMode === 'Pan' ? 'border-amber-500' : ''}
            onClick={() => onSelectToolMode('Pan')}
          >
            ✋ Pan
          </wa-button>
        </div>
      </div>

      {/* Brush Size Presets */}
      <div className="studio-sidebar-section wa-stack" style={{ gap: 'var(--wa-space-2xs)' }}>
        <span className="studio-section-label">Brush Size</span>
        <div className="studio-grid-3col">
          {BRUSH_SIZES.map((size) => (
            <wa-button
              key={size}
              data-testid={`brush-size-${size}`}
              variant={brushSize === size ? 'brand' : 'neutral'}
              size="small"
              data-active={brushSize === size}
              className={brushSize === size ? 'border-amber-500' : ''}
              onClick={() => onSelectBrushSize(size)}
            >
              {size}
            </wa-button>
          ))}
        </div>
      </div>

      {/* 41 Color Swatches */}
      <div className="wa-stack" style={{ flex: '1 1 0%', overflowY: 'auto', padding: 'var(--wa-space-s)', gap: 'var(--wa-space-2xs)' }}>
        <div className="wa-split">
          <span className="studio-section-label">Official Colors ({colors.length})</span>
          {isColorDisabled && (
            <span style={{ fontSize: '10px', color: 'var(--wa-color-text-quiet)' }}>(Disabled in {toolMode})</span>
          )}
        </div>

        <div className={`studio-color-grid ${isColorDisabled ? 'disabled' : ''}`}>
          {colors.map((color) => {
            const isSelected = selectedColorId === color.id && toolMode === 'Brush';
            const swatchId = `swatch-${color.id}`;
            return (
              <button
                key={color.id}
                type="button"
                id={swatchId}
                data-testid={`color-swatch-${color.name}`}
                data-color-id={color.id}
                data-color-name={color.name}
                data-color-hex={color.hex}
                data-selected={isSelected ? 'true' : 'false'}
                onClick={() => onSelectColor(color.id)}
                className={`color-swatch ${isSelected ? 'active ring-2 ring-white' : ''}`}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
        <div style={{ display: 'none' }}>
          {colors.map((color) => (
            <wa-tooltip key={color.id} for={`swatch-${color.id}`}>
              {color.name} ({color.hex})
            </wa-tooltip>
          ))}
        </div>
      </div>
    </aside>
  );
};
