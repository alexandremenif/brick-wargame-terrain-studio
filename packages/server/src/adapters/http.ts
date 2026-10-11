import http from 'node:http';
import { dispatchJsonRpc } from '../generated/router.js';
import type { JsonRpcRequest } from '../generated/router.js';
import type { TerrainEngineService } from '@lego-wargame-terrain-studio/api';

export function createHttpRpcServer(service: TerrainEngineService): http.Server {
  return http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method !== 'POST' || (req.url !== '/rpc' && req.url !== '/')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const jsonRpcReq = JSON.parse(body) as JsonRpcRequest;
        const response = await dispatchJsonRpc(service, jsonRpcReq);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32700,
              message: 'Parse error',
              data: err?.message
            }
          })
        );
      }
    });
  });
}
