import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder, getCString } from '../../src/index.ts';

it('getCString', () => {
  const decoder = new BinaryDecoder(function* () {
    yield { text: yield* getCString() };
    yield { rest: yield -Infinity };
  });

  const text = 'Hello World';
  const rest = Uint8Array.of(0x78, 0x56, 0x34, 0x12);
  const chunk = Uint8Array.from([
    ...new TextEncoder().encode(`${text}\0`),
    ...rest,
  ]);

  const result = [
    ...decoder.decode(chunk.subarray(0, 5)),
    ...decoder.decode(chunk.subarray(5)),
  ];

  assert.deepEqual(result, [{ text }, { rest }]);
});
