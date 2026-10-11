import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateClientForService } from '../src/clientGenerator.js';

describe('clientGenerator', () => {
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

  test('generates concrete client class implementing service interface', () => {
    const code = generateClientForService(genericService, { apiPackage: '@lego-wargame-terrain-studio/api' });

    assert.ok(code.includes("from '@lego-wargame-terrain-studio/api';"));
    assert.ok(code.includes('export interface JsonRpcTransport {'));
    assert.ok(code.includes('export class OrderProcessingServiceClient implements OrderProcessingService {'));
    assert.ok(code.includes('async submitOrder(command: SubmitOrderCommand): Promise<SubmitOrderResponse> {'));
    assert.ok(code.includes("return this.transport.call<SubmitOrderResponse>('submitOrder', command);"));
    assert.ok(code.includes('async cancelOrder(command: CancelOrderCommand): Promise<CancelOrderResponse> {'));
    assert.ok(code.includes("return this.transport.call<CancelOrderResponse>('cancelOrder', command);"));
  });
});
