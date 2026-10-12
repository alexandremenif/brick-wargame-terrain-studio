import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { generateJsonRpc } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('generateJsonRpc (E2E Pipeline)', () => {
  it('generates complete suite of contracts, client, and router from real specs into temp target dirs', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsonrpc-gen-test-'));

    try {
      const targetApiDir = path.join(tmpDir, 'api');
      const targetUiDir = path.join(tmpDir, 'ui');
      const targetServerDir = path.join(tmpDir, 'server');

      await generateJsonRpc({
        specPath: path.join(rootDir, 'specs/server/openrpc.yaml'),
        schemaPaths: [
          path.join(rootDir, 'specs/domain/schemas/model.yaml'),
          path.join(rootDir, 'specs/domain/schemas/commands.yaml'),
        ],
        targetApiDir,
        targetUiDir,
        targetServerDir,
        logger: { log: () => {} },
      });

      // Assert API files exist
      const typesFile = path.join(targetApiDir, 'types.ts');
      const serviceFile = path.join(targetApiDir, 'service.ts');
      assert.ok(fs.existsSync(typesFile), 'types.ts exists');
      assert.ok(fs.existsSync(serviceFile), 'service.ts exists');

      const typesContent = fs.readFileSync(typesFile, 'utf-8');
      assert.match(typesContent, /export interface BoundingBox/);
      assert.match(typesContent, /x: number;/);
      assert.match(typesContent, /y: number;/);
      assert.match(typesContent, /width: number;/);
      assert.match(typesContent, /height: number;/);
      assert.doesNotMatch(typesContent, /Integer[A-Za-z0-9]+/);

      const serviceContent = fs.readFileSync(serviceFile, 'utf-8');
      assert.match(serviceContent, /createAsset\(command: CreateAssetCommand\): Promise<CreateAssetResponse>;/);

      // Assert UI client exists
      const clientFile = path.join(targetUiDir, 'client.ts');
      assert.ok(fs.existsSync(clientFile), 'client.ts exists');
      const clientContent = fs.readFileSync(clientFile, 'utf-8');
      assert.match(clientContent, /async createAsset\(command: CreateAssetCommand\): Promise<CreateAssetResponse>/);

      // Assert Server router exists
      const routerFile = path.join(targetServerDir, 'router.ts');
      assert.ok(fs.existsSync(routerFile), 'router.ts exists');
      const routerContent = fs.readFileSync(routerFile, 'utf-8');
      assert.match(routerContent, /createRpcRouter/);
      assert.match(routerContent, /dispatchJsonRpc/);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
