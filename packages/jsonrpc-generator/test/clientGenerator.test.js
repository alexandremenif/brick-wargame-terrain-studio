import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateClientClass } from '../src/clientGenerator.js';

describe('clientGenerator (Generic)', () => {
  it('generates a typed client class implementing the service interface over transport', () => {
    const mockSpec = {
      serviceName: 'WidgetService',
      clientName: 'WidgetClient',
      definitions: {
        Widget: { title: 'Widget' },
      },
      methods: [
        {
          name: 'getWidget',
          description: 'Fetch widget by id',
          params: [{ name: 'widgetId', typeName: 'string' }],
          result: { name: 'result', typeName: 'Widget' },
        },
      ],
    };

    const clientCode = generateClientClass(mockSpec, {
      apiPackageName: '@test/api',
    });

    assert.match(clientCode, /export class WidgetClient implements WidgetService/);
    assert.match(clientCode, /constructor\(private transport: JsonRpcTransport\)/);
    assert.match(clientCode, /async getWidget\(widgetId: string\): Promise<Widget>/);
    assert.match(clientCode, /return this\.transport\.call<Widget>\('getWidget', widgetId\);/);
    assert.match(clientCode, /import type \{[\s\S]*WidgetService,[\s\S]*Widget,[\s\S]*\} from '@test\/api';/);
  });
});
