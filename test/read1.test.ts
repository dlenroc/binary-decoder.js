import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder } from '../src/BinaryDecoder.ts';

describe('yield N ➡️ where N < 0', () => {
  it('single read', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield -Infinity };
    });

    const chunk = Uint8Array.of(10);
    const result = decoder.decode(chunk);

    assert.deepEqual(result, {
      done: true,
      value: [{ result: chunk }],
    });
  });

  it('multiple reads', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield -2 };
      yield { result: yield -3 };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = decoder.decode(chunk);

    assert.deepEqual(result, {
      done: true,
      value: [{ result: chunk.subarray(0, 2) }, { result: chunk.subarray(2) }],
    });
  });

  it('incremental read', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield -2 };
      yield { result: yield -2 };
      yield { result: yield -3 };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [
      decoder.decode(chunk.subarray(0, 3)),
      decoder.decode(chunk.subarray(3)),
    ];

    assert.deepEqual(result, [
      {
        done: false,
        value: [
          { result: chunk.subarray(0, 2) },
          { result: chunk.subarray(2, 3) },
        ],
      },
      {
        done: true,
        value: [{ result: chunk.subarray(3) }],
      },
    ]);
  });

  it('ignore empty chunks', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield -2 };
      yield { result: yield -3 };
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    const result = [
      decoder.decode(chunk.subarray(0, 0)),
      decoder.decode(chunk.subarray(0, 2)),
      decoder.decode(chunk.subarray(0, 0)),
      decoder.decode(chunk.subarray(0, 0)),
      decoder.decode(chunk.subarray(2)),
    ];

    assert.deepEqual(result, [
      { done: false, value: [] },
      { done: false, value: [{ result: chunk.subarray(0, 2) }] },
      { done: false, value: [] },
      { done: false, value: [] },
      { done: true, value: [{ result: chunk.subarray(2) }] },
    ]);
  });
});
