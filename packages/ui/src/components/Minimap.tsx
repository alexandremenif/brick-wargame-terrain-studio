import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/api';
import { Badge } from './design_system/index.js';

export interface MinimapProps {
  assetWidth: number;
  assetHeight: number;
  cells: CellData[];
  colorsById: Map<number, BrickColor>;
  boundingBox: BoundingBox;
  onCenterAt?: (targetX: number, targetY: number) => void;
}

const BASEPLATE_COLOR = '#184632'; // Authentic dark green baseplate color per spec

export const Minimap: React.FC<MinimapProps> = ({
  assetWidth,
  assetHeight,
  cells,
  colorsById,
  boundingBox,
  onCenterAt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Dynamically observe container content dimensions to eliminate hardcoded sizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerSize({
      width: Math.max(1, container.clientWidth - 16),
      height: Math.max(1, container.clientHeight - 16),
    });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: Math.max(1, entry.contentRect.width),
          height: Math.max(1, entry.contentRect.height),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compute best-fit dimensions preserving the terrain asset's stud aspect ratio
  const { minimapWidth, minimapHeight } = useMemo(() => {
    const availW = containerSize.width > 0 ? containerSize.width : 208;
    const availH = containerSize.height > 0 ? containerSize.height : 128;
    const scale = Math.min(availW / assetWidth, availH / assetHeight);
    return {
      minimapWidth: Math.max(1, Math.round(assetWidth * scale)),
      minimapHeight: Math.max(1, Math.round(assetHeight * scale)),
    };
  }, [containerSize.width, containerSize.height, assetWidth, assetHeight]);

  // Render thumbnail canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Fill background baseplate
    ctx.fillStyle = BASEPLATE_COLOR;
    ctx.fillRect(0, 0, cw, ch);

    // Compute cell dimensions on minimap
    const studW = cw / assetWidth;
    const studH = ch / assetHeight;

    // Draw painted cells
    for (const cell of cells) {
      const color = colorsById.get(cell.colorId);
      ctx.fillStyle = color?.hex ?? '#FFFFFF';
      ctx.fillRect(cell.x * studW, cell.y * studH, Math.max(1, studW), Math.max(1, studH));
    }
  }, [assetWidth, assetHeight, cells, colorsById, minimapWidth, minimapHeight]);

  // Click-to-center navigation handler on canvas directly
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCenterAt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const targetX = Math.min(
      assetWidth - 1,
      Math.max(0, Math.floor((clickX / rect.width) * assetWidth))
    );
    const targetY = Math.min(
      assetHeight - 1,
      Math.max(0, Math.floor((clickY / rect.height) * assetHeight))
    );

    onCenterAt(targetX, targetY);
  };

  // Indicator styles in percentages
  const leftPct = (boundingBox.x / assetWidth) * 100;
  const topPct = (boundingBox.y / assetHeight) * 100;
  const widthPct = (boundingBox.width / assetWidth) * 100;
  const heightPct = (boundingBox.height / assetHeight) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        data-testid="minimap-container"
        className="relative h-[148px] w-full rounded border border-zinc-800 bg-zinc-950 p-2 overflow-hidden flex items-center justify-center cursor-pointer"
      >
        <div
          data-testid="minimap-content"
          style={{ width: `${minimapWidth}px`, height: `${minimapHeight}px` }}
          className="relative flex items-center justify-center shrink-0"
        >
          <canvas
            ref={canvasRef}
            data-testid="minimap-canvas"
            width={minimapWidth}
            height={minimapHeight}
            onClick={handleCanvasClick}
            className="h-full w-full rounded-sm cursor-crosshair pointer-events-auto shadow-sm"
          />

          {/* Bounding box position indicator */}
          <div
            data-testid="minimap-bounding-box-indicator"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              pointerEvents: 'none',
            }}
            className="absolute pointer-events-none border-2 border-amber-400 bg-amber-400/20 transition-all duration-75"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Badge variant="neutral" data-testid="minimap-metrics-badge">
          Asset: {assetWidth}×{assetHeight} | BBox: {boundingBox.width}×{boundingBox.height} at [{boundingBox.x}, {boundingBox.y}]
        </Badge>
      </div>
    </div>
  );
};
