import type { BoundingBox } from './generated/types.js';

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Clamps both dimensions and position of a bounding box so it fits strictly within an asset of size maxW x maxH.
 */
export function clampBoundingBox(
  bbox: { x: number; y: number; width: number; height: number },
  maxW: number,
  maxH: number
): BoundingBox {
  const width = clamp(Math.floor(bbox.width), 1, maxW);
  const height = clamp(Math.floor(bbox.height), 1, maxH);
  const x = clamp(Math.floor(bbox.x), 0, maxW - width);
  const y = clamp(Math.floor(bbox.y), 0, maxH - height);

  return { x, y, width, height };
}

/**
 * Shifts the position of an existing valid bounding box by integer stud offsets (deltaX, deltaY)
 * while preserving its dimensions and clamping within asset boundaries.
 */
export function panBoundingBox(
  bbox: BoundingBox,
  deltaX: number,
  deltaY: number,
  maxW: number,
  maxH: number
): BoundingBox {
  const width = Math.floor(bbox.width);
  const height = Math.floor(bbox.height);
  const x = clamp(Math.round(bbox.x + deltaX), 0, maxW - width);
  const y = clamp(Math.round(bbox.y + deltaY), 0, maxH - height);

  return { x, y, width, height };
}

/**
 * Positions a bounding box of given dimensions such that its center is as close as possible
 * to the target stud coordinate (targetX, targetY).
 */
export function centerBoundingBoxAt(
  targetX: number,
  targetY: number,
  width: number,
  height: number,
  maxW: number,
  maxH: number
): BoundingBox {
  const widthClamped = clamp(Math.floor(width), 1, maxW);
  const heightClamped = clamp(Math.floor(height), 1, maxH);
  const x = clamp(Math.floor(targetX) - Math.floor(widthClamped / 2), 0, maxW - widthClamped);
  const y = clamp(Math.floor(targetY) - Math.floor(heightClamped / 2), 0, maxH - heightClamped);

  return { x, y, width: widthClamped, height: heightClamped };
}

/**
 * Scales the bounding box dimensions proportionally by a positive real scale factor f,
 * anchored at the current bounding box center.
 */
export function zoomBoundingBox(
  bbox: BoundingBox,
  factor: number,
  maxW: number,
  maxH: number
): BoundingBox {
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const wNew = clamp(Math.round(bbox.width * factor), 1, maxW);
  const hNew = clamp(Math.round(bbox.height * factor), 1, maxH);

  const x = clamp(Math.round(cx - wNew / 2), 0, maxW - wNew);
  const y = clamp(Math.round(cy - hNew / 2), 0, maxH - hNew);

  return { x, y, width: wNew, height: hNew };
}

/**
 * Performs best-effort self-healing recovery on raw or potentially corrupt data.
 * Returns null if raw is not an object or coordinates cannot be parsed into finite numbers.
 */
export function recoverBoundingBox(
  raw: any,
  maxW: number,
  maxH: number
): BoundingBox | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const rawX = Number(raw.x);
  const rawY = Number(raw.y);
  const rawW = Number(raw.width);
  const rawH = Number(raw.height);

  if (
    !Number.isFinite(rawX) ||
    !Number.isFinite(rawY) ||
    !Number.isFinite(rawW) ||
    !Number.isFinite(rawH)
  ) {
    return null;
  }

  return clampBoundingBox(
    {
      x: Math.round(rawX),
      y: Math.round(rawY),
      width: Math.round(rawW),
      height: Math.round(rawH),
    },
    maxW,
    maxH
  );
}
