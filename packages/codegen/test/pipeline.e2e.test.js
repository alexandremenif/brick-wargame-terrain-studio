import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCodegen } from '../src/pipeline.js';

describe('pipeline e2e (isolated in os.tmpdir())', () => {
  test('executes end-to-end code generation on generic test schemas in /tmp', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen-sandbox-'));

    try {
      const specsDir = path.join(tempDir, 'specs');
      const domainSpecsDir = path.join(specsDir, '01_domain');
      const persistenceSpecsDir = path.join(specsDir, '03_persistence');

      const targetApiDir = path.join(tempDir, 'packages', 'api', 'src', 'generated');
      const targetClientDir = path.join(tempDir, 'packages', 'client', 'src', 'core', 'generated');
      const targetServerDir = path.join(tempDir, 'packages', 'server', 'src', 'generated');
      const targetServerPersistenceDir = path.join(tempDir, 'packages', 'server', 'src', 'persistence', 'generated');
      const targetMigrationsDir = path.join(tempDir, 'packages', 'server', 'src', 'persistence', 'migrations');

      fs.mkdirSync(domainSpecsDir, { recursive: true });
      fs.mkdirSync(persistenceSpecsDir, { recursive: true });

      // Generic test protobuf fixtures
      const domainProto = `syntax = "proto3";
package generic.test;

message ComputeData {
  int32 id = 1;
}
`;
      fs.writeFileSync(path.join(domainSpecsDir, 'domain.proto'), domainProto, 'utf-8');

      const apiProto = `syntax = "proto3";
package generic.test;
import "domain.proto";

message ComputeRequest {
  int32 x = 1;
  int32 y = 2;
}

message ComputeResponse {
  int32 value = 1;
}

service ComputeService {
  rpc Compute (ComputeRequest) returns (ComputeResponse);
}
`;
      fs.writeFileSync(path.join(domainSpecsDir, 'api.proto'), apiProto, 'utf-8');

      const persistenceProto = `syntax = "proto3";
package generic.test;

message LoadStoreRequest {
  string key = 1;
}

message LoadStoreResponse {
  string value = 1;
}

service StoragePort {
  rpc Load (LoadStoreRequest) returns (LoadStoreResponse);
}
`;
      fs.writeFileSync(path.join(domainSpecsDir, 'persistence.proto'), persistenceProto, 'utf-8');

      // Generic test DBML fixture
      const dbmlContent = `Table inventory {
  id integer [pk]
  sku varchar [not null]
  quantity integer [default: 0]
}
`;
      fs.writeFileSync(path.join(persistenceSpecsDir, 'inventory.dbml'), dbmlContent, 'utf-8');

      const silentLogger = { log: () => {}, error: () => {}, warn: () => {} };

      // Run pipeline with real tools
      await runCodegen({
        rootDir: process.cwd(),
        specsDir,
        targetApiDir,
        targetClientDir,
        targetServerDir,
        targetServerPersistenceDir,
        targetMigrationsDir,
        logger: silentLogger
      });

      // 1. Verify TypeScript contracts in packages/api
      const apiTs = path.join(targetApiDir, 'api.ts');
      assert.ok(fs.existsSync(apiTs), 'api.ts should be generated in targetApiDir');
      const apiServiceTs = path.join(targetApiDir, 'service.ts');
      assert.ok(fs.existsSync(apiServiceTs), 'service.ts should be generated in targetApiDir');
      const serviceTsContent = fs.readFileSync(apiServiceTs, 'utf-8');
      assert.ok(serviceTsContent.includes('export interface ComputeService {'));
      assert.ok(serviceTsContent.includes('compute(command: ComputeRequest): Promise<ComputeResponse>;'));

      // 2. Verify client class in packages/client
      const clientTs = path.join(targetClientDir, 'client.ts');
      assert.ok(fs.existsSync(clientTs), 'client.ts should be generated in targetClientDir');
      const clientTsContent = fs.readFileSync(clientTs, 'utf-8');
      assert.ok(clientTsContent.includes('export class ComputeServiceClient implements ComputeService {'));

      // 3. Verify server dispatcher in packages/server
      const dispatcherTs = path.join(targetServerDir, 'dispatcher.ts');
      assert.ok(fs.existsSync(dispatcherTs), 'dispatcher.ts should be generated in targetServerDir');
      const dispatcherTsContent = fs.readFileSync(dispatcherTs, 'utf-8');
      assert.ok(dispatcherTsContent.includes('export async function dispatchJsonRpc('));
      assert.ok(dispatcherTsContent.includes("case 'compute':"));

      // 4. Verify internal persistence contract in packages/server
      const serverPersistenceTs = path.join(targetServerPersistenceDir, 'persistence.ts');
      assert.ok(fs.existsSync(serverPersistenceTs), 'persistence.ts should be generated in targetServerPersistenceDir');

      // 5. Verify SQLite migration was compiled from DBML
      const generatedMigrationSql = path.join(targetMigrationsDir, '0001_initial_schema.sql');
      assert.ok(fs.existsSync(generatedMigrationSql), '0001_initial_schema.sql should be generated');
      const migrationContent = fs.readFileSync(generatedMigrationSql, 'utf-8');
      assert.ok(migrationContent.includes('CREATE TABLE "inventory"'));
      assert.ok(migrationContent.includes('PRAGMA journal_mode = WAL;'));
    } finally {
      // Ensure isolated test directory is cleaned up
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('completes smoothly when specs directory contains no proto or dbml files', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codegen-empty-sandbox-'));

    try {
      const specsDir = path.join(tempDir, 'empty_specs');
      const targetApiDir = path.join(tempDir, 'packages', 'api', 'src', 'generated');
      const targetMigrationsDir = path.join(tempDir, 'output', 'migrations');
      fs.mkdirSync(specsDir, { recursive: true });

      const silentLogger = { log: () => {}, error: () => {}, warn: () => {} };

      await runCodegen({
        rootDir: process.cwd(),
        specsDir,
        targetApiDir,
        targetMigrationsDir,
        logger: silentLogger
      });

      assert.ok(!fs.existsSync(targetApiDir));
      assert.ok(!fs.existsSync(targetMigrationsDir));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
