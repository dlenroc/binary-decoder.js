import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder } from '../src/BinaryDecoder.ts';

describe('close', () => {
  it('returns remaining buffers after partial decode', () => {
    let closed;

    const decoder = new BinaryDecoder(function* () {
      /* node:coverage disable */
      try {
        yield { result: yield 2 };
        yield Infinity;
        closed ??= false;
      } finally {
        closed ??= true;
      }
      /* node:coverage enable */
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    decoder.decode(chunk);

    const result = decoder.close();
    assert.deepEqual(
      { done: closed, result },
      {
        done: true,
        result: {
          buffers: [chunk.subarray(2)],
          value: [],
        },
      }
    );
  });

  it('returns accumulated values and remaining buffers on decode error', () => {
    const error = new Error('Invalid data');
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 2 };
      throw error;
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    assert.throws(() => decoder.decode(chunk), error);

    const result = decoder.close();
    assert.deepEqual(result, {
      buffers: [chunk.subarray(2)],
      value: [{ result: chunk.subarray(0, 2) }],
    });
  });

  it('returns no values or buffers on re-close', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield 2 };
      throw new Error();
    });

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    assert.throws(() => decoder.decode(chunk));
    decoder.close();

    const result = decoder.close();
    assert.deepEqual(result, {
      buffers: [],
      value: [],
    });
  });

  it('returns buffers passed after close', () => {
    const decoder = new BinaryDecoder(function* () {});

    decoder.close();

    const chunk = Uint8Array.of(10, 20, 30, 40, 50);
    decoder.decode(chunk.subarray(0, 2));
    decoder.decode(chunk.subarray(2));

    const result = decoder.close();
    assert.deepEqual(result, {
      buffers: [chunk.subarray(0, 2), chunk.subarray(2)],
      value: [],
    });
  });
});
