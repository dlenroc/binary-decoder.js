import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getFloat32 } from '../../src/index.ts';

it('getFloat32', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getFloat32() };
  });

  const entries = [
    [0x000000c0, -2],
    [0x00000000, 0],
    [0x00000080, -0],
    [0x0000807f, Infinity],
    [0x000080ff, -Infinity],
    [0xdb0f4940, 3.1415927410125732],
    [0xabaaaa3e, 0.3333333432674408],
    [0x0000c07f, NaN],
  ];

  const chunk = Uint32Array.from(entries.map((it) => it[0]!));
  const result = [...decoder.decode(chunk)];

  assert.deepEqual(
    result,
    entries.map((it) => ({ result: it[1]! }))
  );
});
