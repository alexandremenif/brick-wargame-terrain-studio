import type { TerrainEngineService } from '@lego-wargame-terrain-studio/api';
import { TerrainEngineServiceClient } from './generated/client.js';
import { WebSocketTransport } from './transport.js';

const defaultTransport = new WebSocketTransport();
export const terrainEngineService: TerrainEngineService = new TerrainEngineServiceClient(defaultTransport);
