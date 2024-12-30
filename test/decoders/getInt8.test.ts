import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getInt8 } from '../../src/index.ts';

it('getInt8', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getInt8() };
  });

  const result = [...decoder.decode(Int8Array.of(123, -123))];

  assert.deepEqual(result, [{ result: 123 }, { result: -123 }]);
});
