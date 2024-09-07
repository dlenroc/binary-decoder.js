import assert from 'node:assert/strict';
import { it, mock } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { streamBytesUntil } from '../../src/index.ts';

it('streamBytesUntil', () => {
  const fn = mock.fn();
  const decoder = new BinaryDecoder(function* () {
    yield* streamBytesUntil([0, 0], fn);
    while (true) yield { rest: yield -Infinity };
  });

  const chunk = Uint8Array.of(10, 20, 0, 30, 0, 0, 0, 40, 50);
  const result = [
    decoder.decode(chunk.subarray(0, 1)),
    decoder.decode(chunk.subarray(1, 3)),
    decoder.decode(chunk.subarray(3)),
  ];

  assert.deepEqual(
    fn.mock.calls.map((it) => it.arguments),
    [[chunk.subarray(0, 1)], [chunk.subarray(1, 3)], [chunk.subarray(3, 4)]]
  );

  assert.deepEqual(
    result.map((it) => it.value),
    [[], [], [{ rest: chunk.subarray(6) }]]
  );
});
