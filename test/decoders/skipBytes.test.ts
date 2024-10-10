import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { skipBytes } from '../../src/index.ts';

it('skipBytes', () => {
  const decoder = new BinaryDecoder(function* () {
    yield* skipBytes(2);
    yield { rest: yield -Infinity };
  });

  const chunk = Uint8Array.of(10, 20, 30, 40);
  const result = [...decoder.decode(chunk)];

  assert.deepEqual(result, [{ rest: chunk.subarray(2) }]);
});
