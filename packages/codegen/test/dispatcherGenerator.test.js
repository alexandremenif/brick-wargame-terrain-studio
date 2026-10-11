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

  test('generates typed dispatcher taking service interface', () => {
    const code = generateDispatcherForService(genericService, { importFrom: './orders.js' });

    assert.ok(code.includes("from './orders.js';"));
    assert.ok(code.includes('service: OrderProcessingService,'));
    assert.ok(code.includes('export async function dispatchJsonRpc('));
  });

  test('imports service interface and command DTOs from specified module', () => {
    const code = generateDispatcherForService(genericService, { importFrom: '@lego-wargame-terrain-studio/api' });

    assert.ok(code.includes("from '@lego-wargame-terrain-studio/api';"));
    assert.ok(code.includes('OrderProcessingService'));
    assert.ok(code.includes('SubmitOrderCommand'));
    assert.ok(code.includes('CancelOrderCommand'));
  });

  test('generates dispatchJsonRpc with exhaustive switch cases and error codes', () => {
    const code = generateDispatcherForService(genericService);

    // Verifies switch cases and direct service invocation
    assert.ok(code.includes("case 'submitOrder':"));
    assert.ok(code.includes('await service.submitOrder(params as SubmitOrderCommand)'));
    assert.ok(code.includes("case 'cancelOrder':"));
    assert.ok(code.includes('await service.cancelOrder(params as CancelOrderCommand)'));

    // Verifies standard JSON-RPC 2.0 error handling
    assert.ok(code.includes('error: { code: -32601, message: `Unknown method: ${method}` }'));
    assert.ok(code.includes('error: { code: -32000, message: error?.message || \'Internal engine error\' }'));
  });
});
