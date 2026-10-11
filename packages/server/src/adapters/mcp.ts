import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { AssetService } from '../domain/AssetService.js';
import type { ColorService } from '../domain/ColorService.js';

export function createMcpServer(assetService: AssetService, colorService: ColorService): Server {
  const server = new Server(
    {
      name: 'brick-wargame-terrain-studio',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'create_asset',
          description: 'Creates a new terrain asset with a name and dimensions (W x H)',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Asset name' },
              width: { type: 'integer', minimum: 1, maximum: 1000, description: 'Width in studs' },
              height: { type: 'integer', minimum: 1, maximum: 1000, description: 'Height in studs' }
            },
            required: ['name', 'width', 'height']
          }
        },
        {
          name: 'update_asset',
          description: 'Updates an asset name or dimensions (W x H)',
          inputSchema: {
            type: 'object',
            properties: {
              asset_id: { type: 'string', description: 'Target asset identifier' },
              name: { type: 'string', description: 'New asset name' },
              width: { type: 'integer', minimum: 1, maximum: 1000, description: 'New width in studs' },
              height: { type: 'integer', minimum: 1, maximum: 1000, description: 'New height in studs' }
            },
            required: ['asset_id']
          }
        },
        {
          name: 'get_asset',
          description: 'Retrieves an asset full state, dimensions, and painted cells',
          inputSchema: {
            type: 'object',
            properties: {
              asset_id: { type: 'string', description: 'Target asset identifier' }
            },
            required: ['asset_id']
          }
        },
        {
          name: 'delete_asset',
          description: 'Deletes an asset and all its cells',
          inputSchema: {
            type: 'object',
            properties: {
              asset_id: { type: 'string', description: 'Target asset identifier' }
            },
            required: ['asset_id']
          }
        },
        {
          name: 'paint_area',
          description: 'Paints or erases a rectangular area or 1x1 stud cell with official brick color ID (or null to clear)',
          inputSchema: {
            type: 'object',
            properties: {
              asset_id: { type: 'string', description: 'Target asset identifier' },
              x: { type: 'integer', description: 'Top-left X coordinate' },
              y: { type: 'integer', description: 'Top-left Y coordinate' },
              width: { type: 'integer', minimum: 1, description: 'Area width in studs' },
              height: { type: 'integer', minimum: 1, description: 'Area height in studs' },
              color_id: { type: ['integer', 'null'], description: 'Official brick color ID or null to erase' }
            },
            required: ['asset_id', 'x', 'y', 'width', 'height', 'color_id']
          }
        },
        {
          name: 'list_assets',
          description: 'Lists all available terrain assets',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'list_colors',
          description: 'Lists all official brick colors',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'create_asset': {
          const params = args as { name: string; width: number; height: number };
          const result = await assetService.createAsset({
            name: params.name,
            width: params.width,
            height: params.height
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(result.asset) }]
          };
        }
        case 'update_asset': {
          const params = args as { asset_id: string; name?: string; width?: number; height?: number };
          const result = await assetService.updateAsset({
            assetId: params.asset_id,
            name: params.name,
            width: params.width,
            height: params.height
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(result.asset) }]
          };
        }
        case 'get_asset': {
          const params = args as { asset_id: string };
          const result = await assetService.getAsset({ assetId: params.asset_id });
          return {
            content: [{ type: 'text', text: JSON.stringify(result.asset) }]
          };
        }
        case 'delete_asset': {
          const params = args as { asset_id: string };
          const result = await assetService.deleteAsset({ assetId: params.asset_id });
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }]
          };
        }
        case 'paint_area': {
          const params = args as {
            asset_id: string;
            x: number;
            y: number;
            width: number;
            height: number;
            color_id: number | null;
          };
          const result = await assetService.paintArea({
            assetId: params.asset_id,
            bbox: {
              x: params.x,
              y: params.y,
              width: params.width,
              height: params.height
            },
            colorId: params.color_id
          });
          return {
            content: [{ type: 'text', text: JSON.stringify(result) }]
          };
        }
        case 'list_assets': {
          const result = await assetService.listAssets({});
          return {
            content: [{ type: 'text', text: JSON.stringify(result.assets) }]
          };
        }
        case 'list_colors': {
          const result = await assetService.listColors({});
          return {
            content: [{ type: 'text', text: JSON.stringify(result.colors) }]
          };
        }
        default:
          return {
            isError: true,
            content: [{ type: 'text', text: `Unknown tool: ${name}` }]
          };
      }
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: err?.message || 'Tool execution error' }]
      };
    }
  });

  return server;
}
