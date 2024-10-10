import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder } from '../src/BinaryDecoder.ts';

describe('yield Bytes ➡️ where Bytes is instanceof Uint8Array', () => {
  it('push-back single chunk', () => {
    const decoder = new BinaryDecoder(function* () {
      yield chunk;
      yield { result: yield -Infinity };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [...decoder.decode(Uint8Array.of())];

    assert.deepEqual(result, [{ result: chunk }]);
  });

  it('push-back multiple chunks', () => {
    const decoder = new BinaryDecoder(function* () {
      yield chunk.subarray(0, 2);
      yield chunk.subarray(3, 5);

      yield { result: yield -Infinity };
      yield { result: yield -Infinity };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [...decoder.decode(Uint8Array.of())];

    assert.deepEqual(result, [
      { result: chunk.subarray(3, 5) },
      { result: chunk.subarray(0, 2) },
    ]);
  });

  it('push-back subsequent chunks', () => {
    const decoder = new BinaryDecoder(function* () {
      yield chunk.subarray(2, 4);
      yield chunk.subarray(1, 2);

      yield { result: yield -Infinity };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [...decoder.decode(Uint8Array.of())];

    assert.deepEqual(result, [{ result: chunk.subarray(1, 4) }]);
  });
});
