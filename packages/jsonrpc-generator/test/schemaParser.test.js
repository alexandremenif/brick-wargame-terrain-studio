import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseOpenRpcSpec } from '../src/schemaParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

describe('schemaParser (Generic)', () => {
  it('parses openrpc specification and dynamically infers service and client names', async () => {
    const specPath = path.join(rootDir, 'specs/server/openrpc.yaml');
    const parsed = await parseOpenRpcSpec({ specPath });

    assert.ok(parsed.serviceName.length > 0);
    assert.ok(parsed.clientName.length > 0);
    assert.ok(parsed.methods.length >= 4);

    const methodNames = parsed.methods.map((m) => m.name);
    assert.ok(methodNames.includes('createMap'));
    assert.ok(methodNames.includes('paintArea'));
    assert.ok(methodNames.includes('paintCell'));
    assert.ok(methodNames.includes('undo'));
  });

  it('honors explicitly provided custom service and client names', async () => {
    const specPath = path.join(rootDir, 'specs/server/openrpc.yaml');
    const parsed = await parseOpenRpcSpec({
      specPath,
      serviceName: 'CustomRpcService',
      clientName: 'CustomRpcClient',
    });

    assert.equal(parsed.serviceName, 'CustomRpcService');
    assert.equal(parsed.clientName, 'CustomRpcClient');
  });

  it('merges supplementary schema definitions without domain coupling', async () => {
    const specPath = path.join(rootDir, 'specs/server/openrpc.yaml');
    const schemaPaths = [
      path.join(rootDir, 'specs/domain/schemas/model.yaml'),
      path.join(rootDir, 'specs/domain/schemas/commands.yaml'),
    ];
    const parsed = await parseOpenRpcSpec({ specPath, schemaPaths });

    assert.ok(parsed.definitions.BoundingBox, 'Expected BoundingBox in definitions');
    assert.ok(parsed.definitions.CreateMapCommand, 'Expected CreateMapCommand in definitions');
    assert.ok(parsed.definitions.LegoColor, 'Expected LegoColor in definitions');
  });
});
