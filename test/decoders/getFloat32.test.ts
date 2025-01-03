import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder, getFloat32 } from '../../src/index.ts';

it('getFloat32', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield [yield* getFloat32()];
  });

  const entries = [
    -2,
    0,
    -0,
    Infinity,
    -Infinity,
    3.1415927410125732,
    0.3333333432674408,
    NaN,
  ];

  const result = [
    ...decoder.decode(
      Uint8Array.from(
        entries.flatMap((it) => {
          const bytes = new Uint8Array(4);
          new DataView(bytes.buffer).setFloat32(0, it);
          return [...bytes];
        })
      )
    ),
  ];

  assert.deepEqual(
    result,
    entries.map((it) => [it])
  );
});
