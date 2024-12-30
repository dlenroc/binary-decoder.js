import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getFloat16 } from '../../src/index.ts';

it('getFloat16', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield [yield* getFloat16()];
  });

  const entries: [number, number][] = [
    [0x0000, 0],
    [0x0100, 5.960464477539063e-8],
    [0xff03, 0.00006097555160522461],
    [0x0004, 0.00006103515625],
    [0x5535, 0.333251953125],
    [0xff3b, 0.99951171875],
    [0x003c, 1],
    [0x013c, 1.0009765625],
    [0xff7b, 65504],
    [0x007c, Infinity],
    [0x0080, -0],
    [0x00c0, -2],
    [0x00fc, -Infinity],
    [0x007e, NaN],
  ];

  const result = [
    ...decoder.decode(
      Uint8Array.from(entries.flatMap(([it]) => [it & 0xff, (it >> 8) & 0xff]))
    ),
  ];

  assert.deepEqual(
    result,
    entries.map(([, it]) => [it])
  );
});
