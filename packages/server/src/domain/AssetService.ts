import crypto from 'node:crypto';
import { Asset } from './Asset.js';
import type { AssetRepository } from './AssetRepository.js';
import type { ColorService } from './ColorService.js';
import type {
  CreateAssetCommand,
  CreateAssetResponse,
  UpdateAssetCommand,
  UpdateAssetResponse,
  GetAssetCommand,
  GetAssetResponse,
  DeleteAssetCommand,
  DeleteAssetResponse,
  PaintAreaCommand,
  PaintAreaResponse,
  ListAssetsCommand,
  ListAssetsResponse,
  ListColorsCommand,
  ListColorsResponse,
  ExportImageCommand,
  ExportImageResponse,
  BrickColor,
} from '@lego-wargame-terrain-studio/domain';
import { ImageExportService } from './ImageExportService.js';
import { NodeCanvasImageExporter } from './ImageExporter.js';

export class AssetService {
  private readonly imageExportService: ImageExportService;

  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly colorService: ColorService,
    imageExportService?: ImageExportService
  ) {
    this.imageExportService = imageExportService ?? new ImageExportService(new NodeCanvasImageExporter());
  }

  async createAsset(command: CreateAssetCommand): Promise<CreateAssetResponse> {
    const id = crypto.randomUUID();
    const asset = new Asset({
      id,
      name: command.name,
      width: command.width,
      height: command.height
    });

    await this.assetRepository.create(asset);
    return { asset: asset.toDto() };
  }

  async getAsset(command: GetAssetCommand): Promise<GetAssetResponse> {
    const asset = await this.assetRepository.findById(command.assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${command.assetId}`);
    }
    return { asset: asset.toDto() };
  }

  async listAssets(_command?: ListAssetsCommand): Promise<ListAssetsResponse> {
    const assets = await this.assetRepository.listAll();
    return { assets };
  }

  async updateAsset(command: UpdateAssetCommand): Promise<UpdateAssetResponse> {
    const asset = await this.assetRepository.findById(command.assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${command.assetId}`);
    }

    if (command.name !== undefined) {
      asset.updateName(command.name);
    }
    if (command.width !== undefined || command.height !== undefined) {
      const newWidth = command.width ?? asset.width;
      const newHeight = command.height ?? asset.height;
      asset.updateDimensions(newWidth, newHeight);
    }

    await this.assetRepository.update(asset);
    return { asset: asset.toDto() };
  }

  async deleteAsset(command: DeleteAssetCommand): Promise<DeleteAssetResponse> {
    await this.assetRepository.delete(command.assetId);
    return { success: true };
  }

  async paintArea(command: PaintAreaCommand): Promise<PaintAreaResponse> {
    const asset = await this.assetRepository.findById(command.assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${command.assetId}`);
    }

    if (command.colorId !== null) {
      if (!this.colorService.isValidColorId(command.colorId)) {
        throw new Error(`Invalid color ID: ${command.colorId}`);
      }
    }

    const affectedCellsCount = asset.paintArea(command.bbox, command.colorId);
    await this.assetRepository.update(asset);

    return { affectedCellsCount };
  }

  async listColors(_command?: ListColorsCommand): Promise<ListColorsResponse> {
    const colors = this.colorService.listColors();
    return { colors };
  }

  async exportImage(command: ExportImageCommand): Promise<ExportImageResponse> {
    const asset = await this.assetRepository.findById(command.assetId);
    if (!asset) {
      const err: any = new Error(`Asset not found: ${command.assetId}`);
      err.code = -32602;
      throw err;
    }

    const colors = this.colorService.listColors();
    const colorsById = new Map<number, BrickColor>();
    for (const c of colors) {
      colorsById.set(c.id, c);
    }

    return await this.imageExportService.exportImage(
      {
        id: asset.id,
        width: asset.width,
        height: asset.height,
        cells: asset.getCells(),
      },
      colorsById,
      command
    );
  }
}
