import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DefaultColorService } from '../src/domain/ColorService.js';
import path from 'node:path';

describe('ColorService', () => {
  let colorService: DefaultColorService;

  beforeEach(async () => {
    colorService = new DefaultColorService();
    await colorService.loadColors();
  });

  // TEST-SRV-COLOR-01: ColorService correctly parses all 41 colors with valid integer id, string name, and #RRGGBB hex
  test('TEST-SRV-COLOR-01: correctly parses all 41 colors with valid integer id, string name, hex, and uniqueness', () => {
    const colors = colorService.listColors();
    assert.strictEqual(colors.length, 41);

    const ids = new Set<number>();
    const names = new Set<string>();

    for (const color of colors) {
      assert.ok(Number.isInteger(color.id) && color.id > 0, `Invalid color id: ${color.id}`);
      assert.ok(typeof color.name === 'string' && color.name.length > 0, `Invalid color name: ${color.name}`);
      assert.match(color.hex, /^#[0-9A-Fa-f]{6}$/, `Invalid color hex: ${color.hex}`);

      ids.add(color.id);
      names.add(color.name);
    }

    assert.strictEqual(ids.size, 41, 'All 41 color IDs must be unique');
    assert.strictEqual(names.size, 41, 'All 41 color names must be unique');
  });

  // TEST-SRV-COLOR-02: Validates color IDs (true for official IDs, false for nonexistent IDs)
  test('TEST-SRV-COLOR-02: validates color IDs accurately', () => {
    assert.strictEqual(colorService.isValidColorId(1), true);
    assert.strictEqual(colorService.isValidColorId(2), true);
    assert.strictEqual(colorService.isValidColorId(15), true);
    assert.strictEqual(colorService.isValidColorId(37), true);

    // Boundary & nonexistent IDs
    assert.strictEqual(colorService.isValidColorId(0), false);
    assert.strictEqual(colorService.isValidColorId(42), false);
    assert.strictEqual(colorService.isValidColorId(9999), false);
    assert.strictEqual(colorService.isValidColorId(-1), false);
  });

  // TEST-SRV-COLOR-03: listColors returns the complete list of 41 BrickColor records with lookup parity
  test('TEST-SRV-COLOR-03: listColors returns complete catalog and provides case-insensitive lookup', () => {
    const list = colorService.listColors();
    assert.strictEqual(list.length, 41);

    // Exact case and case-insensitive lookup
    const brightGreen = colorService.getColorByName('Bright Green');
    assert.ok(brightGreen);
    assert.strictEqual(brightGreen.id, 15);
    assert.strictEqual(brightGreen.hex, '#4B9F4A');

    const brightGreenLower = colorService.getColorByName('  bright green  ');
    assert.deepStrictEqual(brightGreenLower, brightGreen);

    const stoneGrey = colorService.getColorById(2);
    assert.ok(stoneGrey);
    assert.strictEqual(stoneGrey.name, 'Medium Stone Grey');
    assert.strictEqual(stoneGrey.hex, '#A0A5A9');

    // Equivalence with list
    const foundInList = list.find(c => c.id === 2);
    assert.deepStrictEqual(stoneGrey, foundInList);

    // Nonexistent lookups return undefined
    assert.strictEqual(colorService.getColorById(9999), undefined);
    assert.strictEqual(colorService.getColorByName('Nonexistent Color'), undefined);
  });

  // TEST-SRV-COLOR-04: After initial load, repeated calls are served strictly from in-memory cache with defensive immutability
  test('TEST-SRV-COLOR-04: operations served in-memory, defensive copy prevents cache mutation, idempotency maintained', async () => {
    const firstList = colorService.listColors();
    firstList.pop(); // Attempt to mutate returned list
    assert.strictEqual(colorService.listColors().length, 41, 'Internal color list must not be mutated by modifying returned array');

    // Idempotent loadColors
    await colorService.loadColors();
    assert.strictEqual(colorService.listColors().length, 41);

    // Uninitialized service throws clear error
    const uninitialized = new DefaultColorService();
    assert.throws(() => uninitialized.listColors(), /ColorService must be loaded before accessing colors/);
    assert.throws(() => uninitialized.getColorById(1), /ColorService must be loaded before accessing colors/);
    assert.throws(() => uninitialized.isValidColorId(1), /ColorService must be loaded before accessing colors/);
  });
});
