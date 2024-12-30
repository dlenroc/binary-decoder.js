import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder, getFloat64 } from '../../src/index.ts';

it('getFloat64', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield [yield* getFloat64()];
  });

  const entries = [
    -2,
    0,
    -0,
    Infinity,
    -Infinity,
    3.141592653589793,
    0.3333333333333333,
    NaN,
  ];

  const result = [
    ...decoder.decode(
      Uint8Array.from(
        entries.flatMap((it) => {
          const bytes = new Uint8Array(8);
          new DataView(bytes.buffer).setFloat64(0, it);
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
