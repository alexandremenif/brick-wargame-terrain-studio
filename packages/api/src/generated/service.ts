/* Generated from OpenRPC specifications. DO NOT EDIT. */
import type {
  Asset,
  BoundingBox,
  CellData,
  CreateAssetCommand,
  CreateAssetResponse,
  GetAssetImageCommand,
  GetAssetImageResponse,
  LegoColor,
  ListAssetsCommand,
  ListAssetsResponse,
  ListColorsCommand,
  ListColorsResponse,
  PaintAreaCommand,
  PaintAreaResponse,
  SetBoundingBoxCommand,
  SetBoundingBoxResponse,
  UpdateAssetDimensionsCommand,
  UpdateAssetDimensionsResponse,
} from './types.js';

export interface TerrainEngineService {
  /**
   * Create a new terrain asset with specified name and dimensions
   */
  createAsset(command: CreateAssetCommand): Promise<CreateAssetResponse>;

  /**
   * Update the dimensions of an existing asset
   */
  updateAssetDimensions(command: UpdateAssetDimensionsCommand): Promise<UpdateAssetDimensionsResponse>;

  /**
   * Set the active bounding box region of an asset
   */
  setBoundingBox(command: SetBoundingBoxCommand): Promise<SetBoundingBoxResponse>;

  /**
   * Paint a rectangular bounding box or 1x1 stud cell with an official LEGO color
   */
  paintArea(command: PaintAreaCommand): Promise<PaintAreaResponse>;

  /**
   * List all existing terrain assets
   */
  listAssets(command: ListAssetsCommand): Promise<ListAssetsResponse>;

  /**
   * List all official LEGO colors
   */
  listColors(command: ListColorsCommand): Promise<ListColorsResponse>;

  /**
   * Get a rendered SVG image of the asset or bounding box
   */
  getAssetImage(command: GetAssetImageCommand): Promise<GetAssetImageResponse>;
}
