import type { TerrainEngineService } from '@lego-wargame-terrain-studio/api';
import { TerrainApiClient } from '../generated/client.js';
import { WebSocketTransport } from './transport.js';

export { TerrainApiClient };
export const terrainEngineService: TerrainEngineService = new TerrainApiClient(new WebSocketTransport());
