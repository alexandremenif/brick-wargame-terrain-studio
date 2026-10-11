import React from 'react';
import type { BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/api';
import { Minimap } from './Minimap.js';
import { Button, NumberInput } from './design_system/index.js';

export interface RightInspectorSidebarProps {
  assetWidth: number;
  assetHeight: number;
  cells: CellData[];
  colorsById: Map<number, BrickColor>;
  boundingBox: BoundingBox;
  onBoundingBoxChange: (bbox: BoundingBox) => void;
  onFitToAsset: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onCenterAt?: (x: number, y: number) => void;
}

export const RightInspectorSidebar: React.FC<RightInspectorSidebarProps> = ({
  assetWidth,
  assetHeight,
  cells,
  colorsById,
  boundingBox,
  onBoundingBoxChange,
  onFitToAsset,
  onZoomIn,
  onZoomOut,
  onCenterAt,
}) => {
  const isFullAsset =
    boundingBox.x === 0 &&
    boundingBox.y === 0 &&
    boundingBox.width === assetWidth &&
    boundingBox.height === assetHeight;

  const isMinSize = boundingBox.width === 1 && boundingBox.height === 1;

  const handleXCommit = (newX: number) => {
    onBoundingBoxChange({ ...boundingBox, x: newX });
  };

  const handleYCommit = (newY: number) => {
    onBoundingBoxChange({ ...boundingBox, y: newY });
  };

  const handleWCommit = (newW: number) => {
    onBoundingBoxChange({ ...boundingBox, width: newW });
  };

  const handleHCommit = (newH: number) => {
    onBoundingBoxChange({ ...boundingBox, height: newH });
  };

  return (
    <aside className="flex w-64 flex-col border-l border-zinc-800 bg-zinc-900 p-4 text-zinc-100 select-none">
      {/* Upper: Minimap */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Minimap Overview
        </label>
        <div className="mt-2">
          <Minimap
            assetWidth={assetWidth}
            assetHeight={assetHeight}
            cells={cells}
            colorsById={colorsById}
            boundingBox={boundingBox}
            onCenterAt={onCenterAt}
          />
        </div>
      </div>

      <div className="my-4 h-px bg-zinc-800" />

      {/* Middle: Bounding Box Parameters & Quick Actions */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Framed Region (BBox)
        </label>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-zinc-400">X Origin</label>
            <NumberInput
              data-testid="inspector-bbox-x"
              value={boundingBox.x}
              min={0}
              max={assetWidth - boundingBox.width}
              onCommit={handleXCommit}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-zinc-400">Y Origin</label>
            <NumberInput
              data-testid="inspector-bbox-y"
              value={boundingBox.y}
              min={0}
              max={assetHeight - boundingBox.height}
              onCommit={handleYCommit}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-zinc-400">Width</label>
            <NumberInput
              data-testid="inspector-bbox-w"
              value={boundingBox.width}
              min={1}
              max={assetWidth - boundingBox.x}
              onCommit={handleWCommit}
              className="mt-1 w-full"
            />
          </div>
          <div>
            <label className="text-zinc-400">Height</label>
            <NumberInput
              data-testid="inspector-bbox-h"
              value={boundingBox.height}
              min={1}
              max={assetHeight - boundingBox.y}
              onCommit={handleHCommit}
              className="mt-1 w-full"
            />
          </div>
        </div>

        {/* Zoom In & Zoom Out Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button
            data-testid="inspector-zoom-in-btn"
            variant="secondary"
            size="sm"
            disabled={isMinSize}
            onClick={onZoomIn}
          >
            Zoom In (+)
          </Button>
          <Button
            data-testid="inspector-zoom-out-btn"
            variant="secondary"
            size="sm"
            disabled={isFullAsset}
            onClick={onZoomOut}
          >
            Zoom Out (-)
          </Button>
        </div>

        <Button
          data-testid="inspector-fit-to-asset-btn"
          variant="secondary"
          size="sm"
          disabled={isFullAsset}
          onClick={onFitToAsset}
          className="mt-1 w-full"
        >
          Fit to Asset
        </Button>
      </div>
    </aside>
  );
};
