import assert from 'node:assert/strict';
import { it, mock } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { streamBytes } from '../../src/index.ts';

it('streamBytes', () => {
  const fn = mock.fn();
  const decoder = new BinaryDecoder(function* () {
    yield* streamBytes(3, fn);
    yield { rest: yield -Infinity };
  });

  const chunk = Uint8Array.of(10, 20, 30, 40, 50);
  [...decoder.decode(chunk.subarray(0, 2))];
  const result = [...decoder.decode(chunk.subarray(2))];

  assert.deepEqual(
    fn.mock.calls.map((it) => it.arguments),
    [[chunk.subarray(0, 2)], [chunk.subarray(2, 3)]]
  );

  assert.deepEqual(result, [{ rest: chunk.subarray(3) }]);
});
