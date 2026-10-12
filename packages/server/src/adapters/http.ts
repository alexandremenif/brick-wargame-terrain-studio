import http from 'node:http';
import { dispatchJsonRpc } from '../generated/router.js';
import type { JsonRpcRequest } from '../generated/router.js';
import type { TerrainEngineService } from '@lego-wargame-terrain-studio/domain';

export function createHttpRpcServer(service: TerrainEngineService): http.Server {
  return http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const reqUrl = req.url?.split('?')[0];
    if (reqUrl === '/health' || reqUrl === '/health/') {
      if (req.method === 'GET' || req.method === 'HEAD') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        });
        if (req.method === 'HEAD') {
          res.end();
        } else {
          res.end(JSON.stringify({ status: 'ok' }));
        }
        return;
      }

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    if (req.method !== 'POST' || (reqUrl !== '/rpc' && reqUrl !== '/')) {
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
