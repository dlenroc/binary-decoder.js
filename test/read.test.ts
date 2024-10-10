import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder } from '../src/BinaryDecoder.ts';

describe('yield N ➡️ where N >= 0', () => {
  it('single read', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 1 };
    });

    const chunk = Uint8Array.of(10);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: chunk }]);
  });

  it('multiple reads', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 2 };
      yield { result: yield 3 };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [
      { result: chunk.subarray(0, 2) },
      { result: chunk.subarray(2) },
    ]);
  });

  it('incremental read', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 2 };
      yield { result: yield 3 };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [
      [...decoder.decode(chunk.subarray(0, 1))],
      [...decoder.decode(chunk.subarray(1, 2))],
      [...decoder.decode(chunk.subarray(2, 3))],
      [...decoder.decode(chunk.subarray(3, 4))],
      [...decoder.decode(chunk.subarray(4, 5))],
    ];

    assert.deepEqual(result, [
      [],
      [{ result: chunk.subarray(0, 2) }],
      [],
      [],
      [{ result: chunk.subarray(2) }],
    ]);
  });

  it('empty read', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 0 };
      yield { result: yield -0 };
      yield { result: yield 1 };
      yield { result: yield -0 };
      yield { result: yield 0 };
    });

    const chunk = Uint8Array.of(10);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [
      { result: chunk.subarray(0, 0) },
      { result: chunk.subarray(0, 0) },
      { result: chunk },
      { result: chunk.subarray(0, 0) },
      { result: chunk.subarray(0, 0) },
    ]);
  });
});
