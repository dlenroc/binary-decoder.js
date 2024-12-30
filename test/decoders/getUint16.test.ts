import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder, getUint16 } from '../../src/index.ts';

describe('getUint16', () => {
  it('big-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getUint16() };
    });

    const chunk = Uint8Array.of(0x12, 0x34);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x1234 }]);
  });

  it('little-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getUint16(true) };
    });

    const chunk = Uint8Array.of(0x34, 0x12);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x1234 }]);
  });
});
