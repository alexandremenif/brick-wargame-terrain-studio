import React, { useState, useEffect } from 'react';
import type { BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/api';
import { Minimap } from './Minimap.js';

export interface RightInspectorSidebarProps {
  assetWidth: number;
  assetHeight: number;
  cells: CellData[];
  colorsById: Map<number, BrickColor>;
  boundingBox: BoundingBox;
  onBoundingBoxChange: (bbox: BoundingBox) => void;
  onFitToAsset: () => void;
}

export const RightInspectorSidebar: React.FC<RightInspectorSidebarProps> = ({
  assetWidth,
  assetHeight,
  cells,
  colorsById,
  boundingBox,
  onBoundingBoxChange,
  onFitToAsset,
}) => {
  const [inputX, setInputX] = useState(String(boundingBox.x));
  const [inputY, setInputY] = useState(String(boundingBox.y));
  const [inputW, setInputW] = useState(String(boundingBox.width));
  const [inputH, setInputH] = useState(String(boundingBox.height));

  useEffect(() => {
    setInputX(String(boundingBox.x));
    setInputY(String(boundingBox.y));
    setInputW(String(boundingBox.width));
    setInputH(String(boundingBox.height));
  }, [boundingBox]);

  // Validation logic: Revert if invalid per spec
  const handleXBlur = () => {
    const val = parseInt(inputX, 10);
    if (isNaN(val) || val < 0 || val + boundingBox.width > assetWidth) {
      setInputX(String(boundingBox.x)); // Revert
    } else {
      onBoundingBoxChange({ ...boundingBox, x: val });
    }
  };

  const handleYBlur = () => {
    const val = parseInt(inputY, 10);
    if (isNaN(val) || val < 0 || val + boundingBox.height > assetHeight) {
      setInputY(String(boundingBox.y)); // Revert
    } else {
      onBoundingBoxChange({ ...boundingBox, y: val });
    }
  };

  const handleWBlur = () => {
    const val = parseInt(inputW, 10);
    if (isNaN(val) || val < 1 || boundingBox.x + val > assetWidth) {
      setInputW(String(boundingBox.width)); // Revert
    } else {
      onBoundingBoxChange({ ...boundingBox, width: val });
    }
  };

  const handleHBlur = () => {
    const val = parseInt(inputH, 10);
    if (isNaN(val) || val < 1 || boundingBox.y + val > assetHeight) {
      setInputH(String(boundingBox.height)); // Revert
    } else {
      onBoundingBoxChange({ ...boundingBox, height: val });
    }
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
            <input
              type="number"
              data-testid="inspector-bbox-x"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              onBlur={handleXBlur}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-200 outline-none focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-zinc-400">Y Origin</label>
            <input
              type="number"
              data-testid="inspector-bbox-y"
              value={inputY}
              onChange={(e) => setInputY(e.target.value)}
              onBlur={handleYBlur}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-200 outline-none focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-zinc-400">Width</label>
            <input
              type="number"
              data-testid="inspector-bbox-w"
              value={inputW}
              onChange={(e) => setInputW(e.target.value)}
              onBlur={handleWBlur}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-200 outline-none focus:border-zinc-700"
            />
          </div>
          <div>
            <label className="text-zinc-400">Height</label>
            <input
              type="number"
              data-testid="inspector-bbox-h"
              value={inputH}
              onChange={(e) => setInputH(e.target.value)}
              onBlur={handleHBlur}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-zinc-200 outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        <button
          type="button"
          data-testid="inspector-fit-to-asset-btn"
          onClick={onFitToAsset}
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          Fit to Asset
        </button>
      </div>
    </aside>
  );
};
