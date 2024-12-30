import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder, getFixedString } from '../../src/index.ts';

it('getFixedString', () => {
  const decoder = new BinaryDecoder(function* () {
    yield { text: yield* getFixedString(5) };
    yield { rest: yield -Infinity };
  });

  const text = 'Hello World';
  const chunk = new TextEncoder().encode(text);
  const result = [...decoder.decode(chunk)];

  assert.deepEqual(result, [
    { text: text.slice(0, 5) },
    { rest: chunk.subarray(5) },
  ]);
});
