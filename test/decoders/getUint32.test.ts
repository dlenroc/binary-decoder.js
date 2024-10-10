import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getUint32 } from '../../src/index.ts';

describe('getUint32', () => {
  it('big-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getUint32() };
    });

    const chunk = Uint8Array.of(0x12, 0x34, 0x56, 0x78);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x12345678 }]);
  });

  it('little-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getUint32(true) };
    });

    const chunk = Uint8Array.of(0x78, 0x56, 0x34, 0x12);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x12345678 }]);
  });
});
