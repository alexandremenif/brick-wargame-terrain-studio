import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../../src/domain/AssetService.js';
import { createHttpRpcServer } from '../../src/adapters/http.js';
import type { StudioWorld } from '../support/world.js';

Given('a running HTTP server', async function (this: StudioWorld) {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const migrationPath = path.resolve('packages/server/src/persistence/migrations/0001_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(migrationSql);

  const colorService = new DefaultColorService();
  await colorService.loadColors();

  const repo = new SqliteAssetRepository(db);
  const service = new AssetService(repo, colorService);

  const server = createHttpRpcServer(service);

  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      this.httpServer = server;
      resolve();
    });
    server.on('error', reject);
  });
});

When(
  'I send an HTTP {word} request to {string}',
  async function (this: StudioWorld, method: string, requestPath: string) {
    assert.ok(this.httpServer, 'HTTP server must be running');
    const address = this.httpServer.address();
    assert.ok(address && typeof address === 'object', 'Server must have valid address object');

    const port = address.port;
    const url = `http://127.0.0.1:${port}${requestPath}`;

    const res = await fetch(url, {
      method: method.toUpperCase(),
    });

    const bodyText = await res.text();
    let bodyJson: any = null;
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      // Body may not be JSON
    }

    const headersRecord: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headersRecord[key.toLowerCase()] = value;
    });

    this.lastHttpResponse = {
      statusCode: res.status,
      headers: headersRecord,
      body: bodyText,
      json: bodyJson,
    };
  }
);

Then('the response status code should be {int}', function (this: StudioWorld, expectedStatusCode: number) {
  assert.ok(this.lastHttpResponse, 'HTTP response must exist');
  assert.strictEqual(
    this.lastHttpResponse.statusCode,
    expectedStatusCode,
    `Expected status code ${expectedStatusCode}, but got ${this.lastHttpResponse.statusCode}`
  );
});

Then('the response Content-Type should be {string}', function (this: StudioWorld, expectedContentType: string) {
  assert.ok(this.lastHttpResponse, 'HTTP response must exist');
  const actualContentType = this.lastHttpResponse.headers['content-type'];
  assert.ok(actualContentType, 'Response must include Content-Type header');
  const mime = actualContentType.split(';')[0].trim();
  assert.strictEqual(
    mime,
    expectedContentType,
    `Expected Content-Type MIME to be "${expectedContentType}", got "${mime}"`
  );
});

Then(
  'the response Cache-Control header should be {string}',
  function (this: StudioWorld, expectedCacheControl: string) {
    assert.ok(this.lastHttpResponse, 'HTTP response must exist');
    const actualCacheControl = this.lastHttpResponse.headers['cache-control'];
    assert.ok(actualCacheControl, 'Response must include Cache-Control header');

    const actualDirectives = actualCacheControl
      .split(',')
      .map(s => s.trim().toLowerCase())
      .sort();
    const expectedDirectives = expectedCacheControl
      .split(',')
      .map(s => s.trim().toLowerCase())
      .sort();

    assert.deepStrictEqual(
      actualDirectives,
      expectedDirectives,
      `Expected Cache-Control directives [${expectedDirectives.join(', ')}], got [${actualDirectives.join(', ')}]`
    );
  }
);

Then('the response Pragma header should be {string}', function (this: StudioWorld, expectedPragma: string) {
  assert.ok(this.lastHttpResponse, 'HTTP response must exist');
  const actualPragma = this.lastHttpResponse.headers['pragma'];
  assert.ok(actualPragma, 'Response must include Pragma header');
  assert.strictEqual(
    actualPragma.trim().toLowerCase(),
    expectedPragma.trim().toLowerCase(),
    `Expected Pragma header to be "${expectedPragma}", got "${actualPragma}"`
  );
});

Then('the response body should be empty', function (this: StudioWorld) {
  assert.ok(this.lastHttpResponse, 'HTTP response must exist');
  assert.strictEqual(
    this.lastHttpResponse.body,
    '',
    `Expected response body to be empty, got: "${this.lastHttpResponse.body}"`
  );
});

Then(
  'the response JSON should contain {string} with value {string}',
  function (this: StudioWorld, key: string, expectedValue: string) {
    assert.ok(this.lastHttpResponse, 'HTTP response must exist');
    assert.ok(this.lastHttpResponse.json, `Response body must be JSON, got: "${this.lastHttpResponse.body}"`);
    assert.strictEqual(
      this.lastHttpResponse.json[key],
      expectedValue,
      `Expected JSON property "${key}" to equal "${expectedValue}", got "${this.lastHttpResponse.json[key]}"`
    );
  }
);
