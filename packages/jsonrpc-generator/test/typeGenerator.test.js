import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateTypesAndService } from '../src/typeGenerator.js';

describe('typeGenerator (Generic)', () => {
  it('compiles schema definitions into clean primitive types without hashed aliases', async () => {
    const mockSpec = {
      serviceName: 'DemoService',
      definitions: {
        Point: {
          title: 'Point',
          type: 'object',
          properties: {
            x: { type: 'integer', description: 'X coordinate' },
            y: { type: 'integer', description: 'Y coordinate' },
            label: { type: 'string', description: 'Point label' },
          },
          required: ['x', 'y'],
          additionalProperties: false,
        },
      },
      methods: [
        {
          name: 'getPoint',
          params: [{ name: 'id', typeName: 'string' }],
          result: { name: 'result', typeName: 'Point' },
        },
      ],
    };

    const { typesCode, serviceCode } = await generateTypesAndService(mockSpec);

    // Assert clean primitive types
    assert.match(typesCode, /export interface Point/);
    assert.match(typesCode, /x: number;/);
    assert.match(typesCode, /y: number;/);
    assert.match(typesCode, /label\?: string;/);

    // Negative assertions: ensure no hashed aliases
    assert.doesNotMatch(typesCode, /Integer[A-Za-z0-9]+/);
    assert.doesNotMatch(typesCode, /String[A-Za-z0-9]+/);

    // Assert service interface
    assert.match(serviceCode, /export interface DemoService/);
    assert.match(serviceCode, /getPoint\(id: string\): Promise<Point>;/);
  });
});
