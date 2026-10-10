import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateDispatcherForService } from '../src/dispatcherGenerator.js';

describe('dispatcherGenerator', () => {
  const genericService = {
    name: 'OrderProcessingService',
    isJsonRpc: true,
    methods: [
      {
        name: 'SubmitOrder',
        camelCaseName: 'submitOrder',
        requestType: 'SubmitOrderCommand',
        responseType: 'SubmitOrderResponse'
      },
      {
        name: 'CancelOrder',
        camelCaseName: 'cancelOrder',
        requestType: 'CancelOrderCommand',
        responseType: 'CancelOrderResponse'
      }
    ]
  };

  test('generates typed handler interface with correct method signatures', () => {
    const code = generateDispatcherForService(genericService, { importFrom: './orders.js' });

    assert.ok(code.includes('export interface IOrderProcessingHandler {'));
    assert.ok(code.includes('submitOrder(command: SubmitOrderCommand): Promise<unknown>;'));
    assert.ok(code.includes('cancelOrder(command: CancelOrderCommand): Promise<unknown>;'));
  });

  test('imports service definition and command DTOs from specified module', () => {
    const code = generateDispatcherForService(genericService, { importFrom: './custom_module.js' });

    assert.ok(code.includes("from './custom_module.js';"));
    assert.ok(code.includes('OrderProcessingServiceDefinition'));
    assert.ok(code.includes('SubmitOrderCommand'));
    assert.ok(code.includes('CancelOrderCommand'));
  });

  test('generates dispatchJsonRpc with exhaustive switch cases and error codes', () => {
    const code = generateDispatcherForService(genericService);

    // Verifies switch cases and fromJSON conversion
    assert.ok(code.includes("case 'submitOrder':"));
    assert.ok(code.includes('await handler.submitOrder(SubmitOrderCommand.fromJSON(params || {}))'));
    assert.ok(code.includes("case 'cancelOrder':"));
    assert.ok(code.includes('await handler.cancelOrder(CancelOrderCommand.fromJSON(params || {}))'));

    // Verifies standard JSON-RPC 2.0 error handling
    assert.ok(code.includes('error: { code: -32601, message: `Unknown method: ${method}` }'));
    assert.ok(code.includes('error: { code: -32000, message: error?.message || \'Internal engine error\' }'));
  });
});
