import React, { useRef, useEffect } from 'react';

export interface CanvasViewportProps {
  gridVisible: boolean;
  onCursorMove?: (x: number, y: number) => void;
}

export function CanvasViewport({ gridVisible, onCursorMove }: CanvasViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fast initial preview rendering of the 118 x 225 playmat
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Playmat background
    ctx.fillStyle = '#184632'; // Default LEGO Dark Green terrain
    ctx.fillRect(40, 20, 118 * 4, 225 * 4);

    // Optional 1px grid
    if (gridVisible) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 40; x <= 40 + 118 * 4; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, 20 + 225 * 4);
        ctx.stroke();
      }
      for (let y = 20; y <= 20 + 225 * 4; y += 16) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(40 + 118 * 4, y);
        ctx.stroke();
      }
    }
  }, [gridVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left - 40;
    const pixelY = e.clientY - rect.top - 20;
    const studX = Math.max(0, Math.min(117, Math.floor(pixelX / 4)));
    const studY = Math.max(0, Math.min(224, Math.floor(pixelY / 4)));
    onCursorMove?.(studX, studY);
  };

  return (
    <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-auto p-4 relative">
      <canvas
        ref={canvasRef}
        width={118 * 4 + 80}
        height={225 * 4 + 40}
        onMouseMove={handleMouseMove}
        className="rounded shadow-2xl border border-zinc-800 cursor-crosshair"
      />
    </div>
  );
}
