import { createCanvas } from '@napi-rs/canvas';
import {
  renderAssetGrid,
  computeAdaptivePixelsPerStud,
  type BoundingBox,
  type BrickColor,
} from '@lego-wargame-terrain-studio/domain';

export interface ImageExporter {
  exportPngBase64(options: {
    assetWidth: number;
    assetHeight: number;
    cells: number[][];
    colorsById: Map<number, BrickColor>;
    bbox?: BoundingBox;
    profile: 'llm' | 'print';
  }): Promise<string>;
}

export class NodeCanvasImageExporter implements ImageExporter {
  async exportPngBase64(options: {
    assetWidth: number;
    assetHeight: number;
    cells: number[][];
    colorsById: Map<number, BrickColor>;
    bbox?: BoundingBox;
    profile: 'llm' | 'print';
  }): Promise<string> {
    const { assetWidth, assetHeight, cells, colorsById, bbox, profile } = options;

    const exportW = bbox ? bbox.width : assetWidth;
    const exportH = bbox ? bbox.height : assetHeight;

    const pixelsPerStud =
      profile === 'print' ? 64 : computeAdaptivePixelsPerStud(exportW, exportH);
    const backgroundMode = profile === 'print' ? 'white' : 'checkerboard';

    const canvasWidth = exportW * pixelsPerStud;
    const canvasHeight = exportH * pixelsPerStud;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    renderAssetGrid(ctx as any, {
      assetWidth,
      assetHeight,
      cells,
      colorsById,
      pixelsPerStud,
      backgroundMode,
      bbox,
    });

    const buffer = canvas.toBuffer('image/png');
    return buffer.toString('base64');
  }
}
