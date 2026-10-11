import type {
  CreateMapCommand,
  CreateMapResponse,
  PaintAreaCommand,
  PaintAreaResponse,
  PaintCellCommand,
  PaintCellResponse,
  UndoCommand,
  UndoResponse,
} from './generated/types.js';

export interface TerrainEngineService {
  createMap(command: CreateMapCommand): Promise<CreateMapResponse>;
  paintArea(command: PaintAreaCommand): Promise<PaintAreaResponse>;
  paintCell(command: PaintCellCommand): Promise<PaintCellResponse>;
  undo(command: UndoCommand): Promise<UndoResponse>;
}
