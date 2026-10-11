import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateServerRouter } from '../src/routerGenerator.js';

describe('routerGenerator (Generic)', () => {
  it('generates a server router and dispatcher wrapping errors cleanly', () => {
    const mockSpec = {
      serviceName: 'WidgetService',
      definitions: {
        Widget: { title: 'Widget' },
      },
      methods: [
        {
          name: 'getWidget',
          params: [{ name: 'widgetId', typeName: 'string' }],
          result: { name: 'result', typeName: 'Widget' },
        },
      ],
      openRpcDoc: {
        openrpc: '1.2.6',
        info: { title: 'Widget API', version: '1.0.0' },
        methods: [],
      },
    };

    const routerCode = generateServerRouter(mockSpec, {
      apiPackageName: '@test/api',
    });

    assert.match(routerCode, /export function createRpcRouter\(service: WidgetService\): Router/);
    assert.match(routerCode, /getWidget: async \(widgetId: string\) =>/);
    assert.match(routerCode, /return await service\.getWidget\(widgetId\);/);
    assert.match(routerCode, /throw new JSONRPCError\(err\.message, err\.code, err\.data\);/);
    assert.match(routerCode, /throw new JSONRPCError\(err\?\.message \|\| 'getWidget failed', -32000, err\);/);
    assert.match(routerCode, /export async function dispatchJsonRpc\(/);
    assert.match(routerCode, /const router = createRpcRouter\(service\);/);
  });
});
