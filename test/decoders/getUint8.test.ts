import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getUint8 } from '../../src/index.ts';

it('getUint8', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getUint8() };
  });

  const result = [...decoder.decode(Uint8Array.of(127, 255))];

  assert.deepEqual(result, [{ result: 127 }, { result: 255 }]);
});
