import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder } from '../../src/BinaryDecoder.ts';
import { getInt16 } from '../../src/index.ts';

it('getInt16', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getInt16() };
  });

  const result = [
    decoder.decode(Uint8Array.of(0x12, 0x34)),
    decoder.decode(Uint8Array.of(0xed, 0xcc)),
  ];

  assert.deepEqual(result, [
    { done: false, value: [{ result: 0x1234 }] },
    { done: false, value: [{ result: -0x1234 }] },
  ]);
});
