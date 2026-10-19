/**
 * Rendering interface and types for 2D Canvas Asset Grid Rendering
 * Follows specs/domain/rendering.md
 */

import type { BoundingBox, BrickColor } from './generated/types.js';

export const MIN_PIXELS_PER_STUD = 2;
export const MAX_PIXELS_PER_STUD = 16;
export const MAX_ADAPTIVE_DIMENSION = 800;

export const CHECKERBOARD_COLOR_A = '#27272a'; // zinc-800
export const CHECKERBOARD_COLOR_B = '#18181b'; // zinc-900
export const WHITE_COLOR = '#FFFFFF';
export const GRID_COLOR = 'rgba(0, 0, 0, 0.15)';

export type BackgroundMode = 'checkerboard' | 'white';

export interface Canvas2DContextLike {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  fillRect(x: number, y: number, w: number, h: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
}

export interface RenderAssetGridOptions {
  assetWidth: number;
  assetHeight: number;
  cells: number[][];
  colorsById: Map<number, BrickColor>;
  pixelsPerStud: number;
  backgroundMode?: BackgroundMode;
  grid?: boolean;
  bbox?: BoundingBox;
}

/**
 * Calculates adaptive pixelsPerStud for 'llm' profile per specs/server/image_export_service.md
 */
export function computeAdaptivePixelsPerStud(widthStuds: number, heightStuds: number): number {
  const maxStuds = Math.max(widthStuds, heightStuds);
  if (maxStuds <= 0) return MIN_PIXELS_PER_STUD;
  const raw = Math.floor(MAX_ADAPTIVE_DIMENSION / maxStuds);
  return Math.max(MIN_PIXELS_PER_STUD, Math.min(MAX_PIXELS_PER_STUD, raw));
}

/**
 * Pure domain 2D canvas asset grid rendering function.
 * Throws if pixelsPerStud < MIN_PIXELS_PER_STUD.
 */
export function renderAssetGrid(
  ctx: Canvas2DContextLike,
  options: RenderAssetGridOptions
): void {
  const {
    assetWidth,
    assetHeight,
    cells,
    colorsById,
    pixelsPerStud,
    backgroundMode = 'checkerboard',
    grid = false,
    bbox,
  } = options;

  if (pixelsPerStud < MIN_PIXELS_PER_STUD) {
    throw new Error(`Minimum stud size is ${MIN_PIXELS_PER_STUD} pixels, received ${pixelsPerStud}`);
  }

  const regionX = bbox ? bbox.x : 0;
  const regionY = bbox ? bbox.y : 0;
  const regionW = bbox ? bbox.width : assetWidth;
  const regionH = bbox ? bbox.height : assetHeight;

  // Draw studs directly from the 2D row-major matrix cells[y][x]
  for (let rx = 0; rx < regionW; rx++) {
    for (let ry = 0; ry < regionH; ry++) {
      const assetX = regionX + rx;
      const assetY = regionY + ry;
      const colorId = cells[assetY]?.[assetX] ?? 0;
      const px = rx * pixelsPerStud;
      const py = ry * pixelsPerStud;

      if (colorId > 0) {
        const brickColor = colorsById.get(colorId);
        ctx.fillStyle = brickColor ? brickColor.hex : WHITE_COLOR;
        ctx.fillRect(px, py, pixelsPerStud, pixelsPerStud);
      } else {
        if (backgroundMode === 'white') {
          ctx.fillStyle = WHITE_COLOR;
          ctx.fillRect(px, py, pixelsPerStud, pixelsPerStud);
        } else {
          // 2x2 checkerboard sub-grid per stud
          const half = pixelsPerStud / 2;
          // (0,0) sub-square: Color A
          ctx.fillStyle = CHECKERBOARD_COLOR_A;
          ctx.fillRect(px, py, half, half);

          // (1,0) sub-square: Color B
          ctx.fillStyle = CHECKERBOARD_COLOR_B;
          ctx.fillRect(px + half, py, half, half);

          // (0,1) sub-square: Color B
          ctx.fillStyle = CHECKERBOARD_COLOR_B;
          ctx.fillRect(px, py + half, half, half);

          // (1,1) sub-square: Color A
          ctx.fillStyle = CHECKERBOARD_COLOR_A;
          ctx.fillRect(px + half, py + half, half, half);
        }
      }
    }
  }

  // Alignment grid overlay
  if (grid && pixelsPerStud > 3) {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();

    const canvasW = regionW * pixelsPerStud;
    const canvasH = regionH * pixelsPerStud;

    for (let c = 0; c <= regionW; c++) {
      const gx = c * pixelsPerStud;
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvasH);
    }

    for (let r = 0; r <= regionH; r++) {
      const gy = r * pixelsPerStud;
      ctx.moveTo(0, gy);
      ctx.lineTo(canvasW, gy);
    }

    ctx.stroke();
  }
}
