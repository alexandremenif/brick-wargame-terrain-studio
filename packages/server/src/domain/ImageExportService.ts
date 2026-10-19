import type {
  ExportImageCommand,
  ExportImageResponse,
  BoundingBox,
  BrickColor,
} from '@lego-wargame-terrain-studio/domain';
import type { ImageExporter } from './ImageExporter.js';

export interface ExportTargetAsset {
  id: string;
  width: number;
  height: number;
  cells: number[][];
}

export class ImageExportService {
  constructor(private readonly imageExporter: ImageExporter) {}

  async exportImage(
    asset: ExportTargetAsset,
    colorsById: Map<number, BrickColor>,
    command: ExportImageCommand
  ): Promise<ExportImageResponse> {
    const profile = command.profile ?? 'llm';
    if (profile !== 'llm' && profile !== 'print') {
      const err: any = new Error(`Invalid params: Unrecognized profile '${profile}'`);
      err.code = -32602;
      throw err;
    }

    if (command.bbox) {
      this.validateBoundingBox(command.bbox, asset.width, asset.height);
    }

    const data = await this.imageExporter.exportPngBase64({
      assetWidth: asset.width,
      assetHeight: asset.height,
      cells: asset.cells,
      colorsById,
      bbox: command.bbox,
      profile,
    });

    return { data };
  }

  private validateBoundingBox(bbox: BoundingBox, assetW: number, assetH: number): void {
    if (
      bbox.x < 0 ||
      bbox.y < 0 ||
      bbox.width < 1 ||
      bbox.height < 1 ||
      bbox.x + bbox.width > assetW ||
      bbox.y + bbox.height > assetH
    ) {
      const err: any = new Error('Invalid params: Bounding box exceeds asset boundaries');
      err.code = -32602;
      throw err;
    }
  }
}
