import React, { useEffect, useRef } from 'react';
import type { BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/api';

export interface MinimapProps {
  assetWidth: number;
  assetHeight: number;
  cells: CellData[];
  colorsById: Map<number, BrickColor>;
  boundingBox: BoundingBox;
}

const BASEPLATE_COLOR = '#184632'; // Authentic dark green baseplate color per spec

export const Minimap: React.FC<MinimapProps> = ({
  assetWidth,
  assetHeight,
  cells,
  colorsById,
  boundingBox,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  }, [assetWidth, assetHeight, cells, colorsById]);

  // Indicator styles in percentages
  const leftPct = (boundingBox.x / assetWidth) * 100;
  const topPct = (boundingBox.y / assetHeight) * 100;
  const widthPct = (boundingBox.width / assetWidth) * 100;
  const heightPct = (boundingBox.height / assetHeight) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="minimap-container"
        className="relative h-[148px] w-full rounded border border-zinc-800 bg-zinc-950 p-2 overflow-hidden flex items-center justify-center"
      >
        <div className="relative h-full w-full">
          <canvas
            ref={canvasRef}
            data-testid="minimap-canvas"
            width={208}
            height={132}
            className="h-full w-full rounded-sm"
          />

          {/* Bounding box position indicator */}
          <div
            data-testid="minimap-bounding-box-indicator"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
            }}
            className="absolute pointer-events-none border-2 border-amber-400 bg-amber-400/20 transition-all duration-75"
          />
        </div>
      </div>

      <div className="text-[11px] text-zinc-400 text-center font-mono select-none">
        Asset: {assetWidth}×{assetHeight} | BBox: {boundingBox.width}×{boundingBox.height} at [{boundingBox.x}, {boundingBox.y}]
      </div>
    </div>
  );
};
