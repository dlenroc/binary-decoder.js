import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BinaryDecoder, getBigUint64 } from '../../src/index.ts';

describe('getBigUint64', () => {
  it('big-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getBigUint64() };
    });

    const chunk = Uint8Array.of(0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x123456789abcdef0n }]);
  });

  it('little-endian', () => {
    const decoder = new BinaryDecoder(function* () {
      yield { result: yield* getBigUint64(true) };
    });

    const chunk = Uint8Array.of(0xf0, 0xde, 0xbc, 0x9a, 0x78, 0x56, 0x34, 0x12);
    const result = [...decoder.decode(chunk)];

    assert.deepEqual(result, [{ result: 0x123456789abcdef0n }]);
  });
});
