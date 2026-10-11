/* Generated from OpenRPC specifications. DO NOT EDIT. */
import type {
  BoundingBox,
  CellData,
  CreateMapCommand,
  CreateMapResponse,
  LegoColor,
  PaintAreaCommand,
  PaintAreaResponse,
  PaintCellCommand,
  PaintCellResponse,
  TerrainMapSummary,
  UndoCommand,
  UndoResponse,
} from './types.js';

export interface TerrainEngineService {
  /**
   * Create a new terrain map asset with specified dimensions
   */
  createMap(command: CreateMapCommand): Promise<CreateMapResponse>;

  /**
   * Paint a rectangular bounding box with an official LEGO color
   */
  paintArea(command: PaintAreaCommand): Promise<PaintAreaResponse>;

  /**
   * Paint an individual stud cell
   */
  paintCell(command: PaintCellCommand): Promise<PaintCellResponse>;

  /**
   * Undo the most recent command on the specified map
   */
  undo(command: UndoCommand): Promise<UndoResponse>;
}
