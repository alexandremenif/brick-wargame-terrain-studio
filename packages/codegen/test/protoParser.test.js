import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseProtoContent } from '../src/protoParser.js';

describe('protoParser', () => {
  test('extracts services and RPC methods with camelCase mapping', () => {
    const protoContent = `
syntax = "proto3";
package test.app;

message CreateUserRequest { string name = 1; }
message CreateUserResponse { string id = 1; }

// @jsonrpc
service UserService {
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse);
}
`;

    const result = parseProtoContent(protoContent, 'user.proto');
    assert.equal(result.package, 'test.app');
    assert.equal(result.services.length, 1);

    const service = result.services[0];
    assert.equal(service.name, 'UserService');
    assert.equal(service.isJsonRpc, true);
    assert.equal(service.methods.length, 1);

    const method = service.methods[0];
    assert.equal(method.name, 'CreateUser');
    assert.equal(method.camelCaseName, 'createUser');
    assert.equal(method.requestType, 'CreateUserRequest');
    assert.equal(method.responseType, 'CreateUserResponse');
  });

  test('differentiates between @jsonrpc services and internal services', () => {
    const protoContent = `
syntax = "proto3";

// Internal store without RPC exposure
service InternalAuditStore {
  rpc RecordAuditLog (AuditEntry) returns (AuditResult);
}

// Public API
// @jsonrpc
service PublicGatewayService {
  rpc Ping (Empty) returns (Pong);
}
message AuditEntry {}
message AuditResult {}
message Empty {}
message Pong {}
`;

    const result = parseProtoContent(protoContent);
    assert.equal(result.services.length, 2);

    const internalService = result.services.find(s => s.name === 'InternalAuditStore');
    const publicService = result.services.find(s => s.name === 'PublicGatewayService');

    assert.ok(internalService);
    assert.equal(internalService.isJsonRpc, false);

    assert.ok(publicService);
    assert.equal(publicService.isJsonRpc, true);
  });

  test('handles proto files with no services without errors', () => {
    const protoContent = `
syntax = "proto3";
package test.models;

message Account {
  string id = 1;
  double balance = 2;
}
`;

    const result = parseProtoContent(protoContent);
    assert.equal(result.services.length, 0);
    assert.equal(result.package, 'test.models');
  });
});
