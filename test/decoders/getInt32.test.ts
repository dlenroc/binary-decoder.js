import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getInt32 } from '../../src/index.ts';

it('getInt32', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getInt32() };
  });

  const result = [
    decoder.decode(Uint8Array.of(0x12, 0x34, 0x56, 0x78)),
    decoder.decode(Uint8Array.of(0xed, 0xcb, 0xa9, 0x88)),
  ];

  assert.deepEqual(result, [
    { done: false, value: [{ result: 0x12345678 }] },
    { done: false, value: [{ result: -0x12345678 }] },
  ]);
});
