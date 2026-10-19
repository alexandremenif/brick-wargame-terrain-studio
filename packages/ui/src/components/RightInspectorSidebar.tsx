import React, { useState, useEffect } from 'react';
import type { BoundingBox, BrickColor } from '@lego-wargame-terrain-studio/domain';
import { Minimap } from './Minimap.js';

export interface RightInspectorSidebarProps {
  assetWidth: number;
  assetHeight: number;
  cells: number[][];
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

  const [localX, setLocalX] = useState<string>(String(boundingBox.x));
  const [localY, setLocalY] = useState<string>(String(boundingBox.y));
  const [localW, setLocalW] = useState<string>(String(boundingBox.width));
  const [localH, setLocalH] = useState<string>(String(boundingBox.height));

  useEffect(() => {
    setLocalX(String(boundingBox.x));
  }, [boundingBox.x]);

  useEffect(() => {
    setLocalY(String(boundingBox.y));
  }, [boundingBox.y]);

  useEffect(() => {
    setLocalW(String(boundingBox.width));
  }, [boundingBox.width]);

  useEffect(() => {
    setLocalH(String(boundingBox.height));
  }, [boundingBox.height]);

  const commitX = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const maxX = assetWidth - boundingBox.width;
    if (!isNaN(val) && val >= 0 && val <= maxX) {
      onBoundingBoxChange({ ...boundingBox, x: val });
    } else {
      setLocalX(String(boundingBox.x));
    }
  };

  const commitY = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const maxY = assetHeight - boundingBox.height;
    if (!isNaN(val) && val >= 0 && val <= maxY) {
      onBoundingBoxChange({ ...boundingBox, y: val });
    } else {
      setLocalY(String(boundingBox.y));
    }
  };

  const commitW = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const maxW = assetWidth - boundingBox.x;
    if (!isNaN(val) && val >= 1 && val <= maxW) {
      onBoundingBoxChange({ ...boundingBox, width: val });
    } else {
      setLocalW(String(boundingBox.width));
    }
  };

  const commitH = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const maxH = assetHeight - boundingBox.y;
    if (!isNaN(val) && val >= 1 && val <= maxH) {
      onBoundingBoxChange({ ...boundingBox, height: val });
    } else {
      setLocalH(String(boundingBox.height));
    }
  };

  return (
    <aside className="studio-sidebar studio-sidebar-right wa-stack" data-testid="right-inspector-sidebar" style={{ gap: 'var(--wa-space-m)' }}>
      {/* Upper: Minimap */}
      <div className="wa-stack" style={{ gap: 'var(--wa-space-xs)' }}>
        <span className="studio-section-label">Minimap Overview</span>
        <Minimap
          assetWidth={assetWidth}
          assetHeight={assetHeight}
          cells={cells}
          colorsById={colorsById}
          boundingBox={boundingBox}
          onCenterAt={onCenterAt}
        />
      </div>

      <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--wa-color-surface-border, #27272a)' }} />

      {/* Middle: Bounding Box Parameters & Quick Actions */}
      <div className="wa-stack" style={{ gap: 'var(--wa-space-s)' }}>
        <span className="studio-section-label">Framed Region (BBox)</span>

        <div className="studio-grid-2col">
          <label className="wa-stack" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span className="studio-field-label">X Origin</span>
            <wa-input
              data-testid="inspector-bbox-x"
              type="number"
              size="small"
              min={0}
              max={assetWidth - boundingBox.width}
              value={localX}
              onwa-input={(e: any) => setLocalX(e.target.value)}
              onInput={(e: any) => setLocalX(e.target.value)}
              onBlur={(e: any) => commitX(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') commitX((e.target as any).value);
                else if (e.key === 'Escape') setLocalX(String(boundingBox.x));
              }}
            />
          </label>
          <label className="wa-stack" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span className="studio-field-label">Y Origin</span>
            <wa-input
              data-testid="inspector-bbox-y"
              type="number"
              size="small"
              min={0}
              max={assetHeight - boundingBox.height}
              value={localY}
              onwa-input={(e: any) => setLocalY(e.target.value)}
              onInput={(e: any) => setLocalY(e.target.value)}
              onBlur={(e: any) => commitY(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') commitY((e.target as any).value);
                else if (e.key === 'Escape') setLocalY(String(boundingBox.y));
              }}
            />
          </label>
          <label className="wa-stack" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span className="studio-field-label">Width</span>
            <wa-input
              data-testid="inspector-bbox-w"
              type="number"
              size="small"
              min={1}
              max={assetWidth - boundingBox.x}
              value={localW}
              onwa-input={(e: any) => setLocalW(e.target.value)}
              onInput={(e: any) => setLocalW(e.target.value)}
              onBlur={(e: any) => commitW(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') commitW((e.target as any).value);
                else if (e.key === 'Escape') setLocalW(String(boundingBox.width));
              }}
            />
          </label>
          <label className="wa-stack" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span className="studio-field-label">Height</span>
            <wa-input
              data-testid="inspector-bbox-h"
              type="number"
              size="small"
              min={1}
              max={assetHeight - boundingBox.y}
              value={localH}
              onwa-input={(e: any) => setLocalH(e.target.value)}
              onInput={(e: any) => setLocalH(e.target.value)}
              onBlur={(e: any) => commitH(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') commitH((e.target as any).value);
                else if (e.key === 'Escape') setLocalH(String(boundingBox.height));
              }}
            />
          </label>
        </div>

        {/* Zoom In & Zoom Out Buttons */}
        <div className="studio-grid-2col">
          <wa-button
            data-testid="inspector-zoom-in-btn"
            variant="neutral"
            size="small"
            disabled={isMinSize}
            onClick={onZoomIn}
          >
            Zoom In (+)
          </wa-button>
          <wa-button
            data-testid="inspector-zoom-out-btn"
            variant="neutral"
            size="small"
            disabled={isFullAsset}
            onClick={onZoomOut}
          >
            Zoom Out (-)
          </wa-button>
        </div>

        <wa-button
          data-testid="inspector-fit-to-asset-btn"
          variant="neutral"
          size="small"
          disabled={isFullAsset}
          onClick={onFitToAsset}
          style={{ width: '100%' }}
        >
          Fit to Asset
        </wa-button>
      </div>
    </aside>
  );
};
