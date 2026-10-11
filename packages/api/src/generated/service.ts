/* Generated from OpenRPC specifications. DO NOT EDIT. */
import type {
  Asset,
  AssetSummary,
  BoundingBox,
  BrickColor,
  CellData,
  CreateAssetCommand,
  CreateAssetResponse,
  DeleteAssetCommand,
  DeleteAssetResponse,
  GetAssetCommand,
  GetAssetResponse,
  ListAssetsCommand,
  ListAssetsResponse,
  ListColorsCommand,
  ListColorsResponse,
  PaintAreaCommand,
  PaintAreaResponse,
  UpdateAssetCommand,
  UpdateAssetResponse,
} from './types.js';

export interface TerrainEngineService {
  /**
   * Create a new terrain asset with specified name and dimensions
   */
  createAsset(command: CreateAssetCommand): Promise<CreateAssetResponse>;

  /**
   * Update the name or dimensions of an existing asset
   */
  updateAsset(command: UpdateAssetCommand): Promise<UpdateAssetResponse>;

  /**
   * Retrieve an asset full state including painted cells
   */
  getAsset(command: GetAssetCommand): Promise<GetAssetResponse>;

  /**
   * Delete an asset and its cells
   */
  deleteAsset(command: DeleteAssetCommand): Promise<DeleteAssetResponse>;

  /**
   * Paint or erase a rectangular bounding box or 1x1 stud cell with an official brick color (or null to clear)
   */
  paintArea(command: PaintAreaCommand): Promise<PaintAreaResponse>;

  /**
   * List all existing terrain assets
   */
  listAssets(command: ListAssetsCommand): Promise<ListAssetsResponse>;

  /**
   * List all official brick colors
   */
  listColors(command: ListColorsCommand): Promise<ListColorsResponse>;
}
