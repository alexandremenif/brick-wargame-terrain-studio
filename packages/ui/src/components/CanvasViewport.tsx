import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/api';
import type { BrushSize, ToolMode } from './LeftToolboxSidebar.js';

export interface CanvasViewportProps {
  boundingBox: BoundingBox;
  cells: CellData[];
  colorsById: Map<number, BrickColor>;
  showGrid: boolean;
  toolMode: ToolMode;
  brushSize: BrushSize;
  selectedColorId: number;
  onPaint: (x: number, y: number, width: number, height: number, colorId: number | null) => void;
}

const BASEPLATE_COLOR = '#184632'; // Authentic dark green baseplate color per spec

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  boundingBox,
  cells,
  colorsById,
  showGrid,
  toolMode,
  brushSize,
  selectedColorId,
  onPaint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Map coordinate key "x,y" to colorId for O(1) cell color lookup
  const cellsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const cell of cells) {
      map.set(`${cell.x},${cell.y}`, cell.colorId);
    }
    return map;
  }, [cells]);

  // Track viewport container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Compute best-fit stud size and canvas pixel dimensions
  const { studSize, canvasWidth, canvasHeight, offsetX, offsetY } = useMemo(() => {
    const cw = Math.max(10, containerSize.width);
    const ch = Math.max(10, containerSize.height);

    const sSize = Math.max(
      2,
      Math.floor(Math.min(cw / boundingBox.width, ch / boundingBox.height))
    );

    const cWidth = sSize * boundingBox.width;
    const cHeight = sSize * boundingBox.height;

    return {
      studSize: sSize,
      canvasWidth: cWidth,
      canvasHeight: cHeight,
      offsetX: Math.floor((cw - cWidth) / 2),
      offsetY: Math.floor((ch - cHeight) / 2),
    };
  }, [containerSize, boundingBox]);

  // Immediate-mode canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill viewport baseplate
    ctx.fillStyle = BASEPLATE_COLOR;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw cells within the active bounding box
    const startX = boundingBox.x;
    const startY = boundingBox.y;
    const endX = boundingBox.x + boundingBox.width;
    const endY = boundingBox.y + boundingBox.height;

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const colorId = cellsMap.get(`${x},${y}`);
        if (colorId !== undefined) {
          const color = colorsById.get(colorId);
          ctx.fillStyle = color?.hex ?? '#FFFFFF';
          const px = (x - startX) * studSize;
          const py = (y - startY) * studSize;
          ctx.fillRect(px, py, studSize, studSize);
        }
      }
    }

    // Optional 1px alignment grid
    if (showGrid && studSize > 3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      // Vertical lines
      for (let i = 0; i <= boundingBox.width; i++) {
        const x = i * studSize + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
      }

      // Horizontal lines
      for (let j = 0; j <= boundingBox.height; j++) {
        const y = j * studSize + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
      }

      ctx.stroke();
    }
  }, [canvasWidth, canvasHeight, boundingBox, cellsMap, colorsById, showGrid, studSize]);

  // Click-to-paint handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const colInBbox = Math.floor(clickX / studSize);
    const rowInBbox = Math.floor(clickY / studSize);

    if (
      colInBbox < 0 ||
      colInBbox >= boundingBox.width ||
      rowInBbox < 0 ||
      rowInBbox >= boundingBox.height
    ) {
      return;
    }

    const studX = boundingBox.x + colInBbox;
    const studY = boundingBox.y + rowInBbox;

    // Parse brush size
    const [bwStr, bhStr] = brushSize.split('x');
    const bw = parseInt(bwStr, 10);
    const bh = parseInt(bhStr, 10);

    const colorToApply = toolMode === 'Eraser' ? null : selectedColorId;

    onPaint(studX, studY, bw, bh, colorToApply);
  };

  return (
    <main
      ref={containerRef}
      data-testid="canvas-viewport-container"
      className="relative flex-1 bg-zinc-950 overflow-hidden select-none flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        data-testid="canvas-viewport"
        width={canvasWidth}
        height={canvasHeight}
        onPointerDown={handlePointerDown}
        style={{
          cursor: toolMode === 'Eraser' ? 'cell' : 'crosshair',
        }}
        className="shadow-2xl border border-zinc-800"
      />
    </main>
  );
};
