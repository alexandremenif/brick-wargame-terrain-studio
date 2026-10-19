import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  renderAssetGrid,
  type BoundingBox,
  type BrickColor,
} from '@lego-wargame-terrain-studio/domain';
import type { BrushSize, ToolMode } from './LeftToolboxSidebar.js';

export interface CanvasViewportProps {
  boundingBox: BoundingBox;
  cells: number[][];
  colorsById: Map<number, BrickColor>;
  showGrid: boolean;
  toolMode: ToolMode;
  brushSize: BrushSize;
  selectedColorId: number;
  onPaint: (x: number, y: number, width: number, height: number, colorId: number) => void;
  onPanBy?: (deltaX: number, deltaY: number) => void;
  onZoom?: (factor: number) => void;
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
  onPanBy,
  onZoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; accDeltaX: number; accDeltaY: number }>({
    clientX: 0,
    clientY: 0,
    accDeltaX: 0,
    accDeltaY: 0,
  });

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
  const { studSize, canvasWidth, canvasHeight } = useMemo(() => {
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
    };
  }, [containerSize, boundingBox]);

  // Immediate-mode canvas rendering via domain renderAssetGrid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    renderAssetGrid(ctx as any, {
      assetWidth: boundingBox.width,
      assetHeight: boundingBox.height,
      cells,
      colorsById,
      pixelsPerStud: studSize,
      backgroundMode: 'checkerboard',
      grid: showGrid,
      bbox: boundingBox,
    });
  }, [canvasWidth, canvasHeight, boundingBox, cells, colorsById, showGrid, studSize]);

  // Pointer interactions: Click-to-paint (Brush/Eraser) vs Drag-to-pan (Pan)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (toolMode === 'Pan') {
      setIsDragging(true);
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        accDeltaX: 0,
        accDeltaY: 0,
      };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch (_) {
        // Ignored if pointer capture is not supported or pointer is inactive
      }
      return;
    }

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

    const colorToApply = toolMode === 'Eraser' ? 0 : selectedColorId;

    onPaint(studX, studY, bw, bh, colorToApply);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || toolMode !== 'Pan' || !onPanBy) return;

    const totalDeltaX = e.clientX - dragStartRef.current.clientX;
    const totalDeltaY = e.clientY - dragStartRef.current.clientY;

    const targetStudsX = Math.round(totalDeltaX / studSize);
    const targetStudsY = Math.round(totalDeltaY / studSize);

    const stepDeltaX = targetStudsX - dragStartRef.current.accDeltaX;
    const stepDeltaY = targetStudsY - dragStartRef.current.accDeltaY;

    if (stepDeltaX !== 0 || stepDeltaY !== 0) {
      onPanBy(-stepDeltaX, -stepDeltaY);
      dragStartRef.current.accDeltaX = targetStudsX;
      dragStartRef.current.accDeltaY = targetStudsY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {
        // Ignored
      }
    }
  };

  // Native non-passive wheel listener allowing preventDefault without browser passive listener violations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onZoom) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        // Zoom in (~25% reduction -> factor 0.8)
        onZoom(0.8);
      } else if (e.deltaY > 0) {
        // Zoom out (~25% enlargement -> factor 1.25)
        onZoom(1.25);
      }
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [onZoom]);

  const getCursorStyle = () => {
    if (toolMode === 'Pan') {
      return isDragging ? 'grabbing' : 'grab';
    }
    return toolMode === 'Eraser' ? 'cell' : 'crosshair';
  };

  return (
    <main
      ref={containerRef}
      data-testid="canvas-viewport-container"
      className="studio-viewport"
    >
      <canvas
        ref={canvasRef}
        data-testid="canvas-viewport"
        width={canvasWidth}
        height={canvasHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseDown={handlePointerDown as any}
        onMouseMove={handlePointerMove as any}
        onMouseUp={handlePointerUp as any}
        style={{
          cursor: getCursorStyle(),
        }}
      />
    </main>
  );
};
