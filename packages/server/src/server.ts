import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { DefaultColorService } from './domain/ColorService.js';
import { SqliteAssetRepository } from './persistence/SqliteAssetRepository.js';
import { AssetService } from './domain/AssetService.js';
import { createHttpRpcServer } from './adapters/http.js';

const distUiDir = path.resolve(process.cwd(), 'packages/ui/dist');
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

async function startServer() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const candidatePaths = [
    path.resolve(process.cwd(), 'packages/server/src/persistence/migrations/0001_initial_schema.sql'),
    path.resolve(process.cwd(), 'src/persistence/migrations/0001_initial_schema.sql'),
  ];
  const migrationPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(migrationSql);

  const colorService = new DefaultColorService();
  await colorService.loadColors();

  const assetRepository = new SqliteAssetRepository(db);
  const assetService = new AssetService(assetRepository, colorService);

  // Pre-seed default asset
  await assetService.createAsset({
    name: 'Modular Outpost',
    width: 32,
    height: 32,
  });

  const rpcServer = createHttpRpcServer(assetService);

  const server = http.createServer((req, res) => {
    if (req.url === '/rpc' || req.url === '/rpc/') {
      // Forward to RPC server request listener
      rpcServer.emit('request', req, res);
      return;
    }

    // Serve static UI assets
    let reqPath = req.url?.split('?')[0] || '/';
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(distUiDir, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(path.join(distUiDir, 'index.html')).pipe(res);
    }
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(PORT, () => {
    console.log(`Brick Studio Web & RPC Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
