import assert from 'node:assert/strict';
import { it } from 'node:test';
import { BinaryDecoder, getBigInt64 } from '../../src/index.ts';

it('getBigInt64', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) yield { result: yield* getBigInt64() };
  });

  const result = [
    [
      ...decoder.decode(
        Uint8Array.of(0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0)
      ),
    ],
    [
      ...decoder.decode(
        Uint8Array.of(0xed, 0xcb, 0xa9, 0x88, 0x76, 0x54, 0x32, 0x10)
      ),
    ],
  ];

  assert.deepEqual(result, [
    [{ result: 0x123456789abcdef0n }],
    [{ result: -0x1234567789abcdf0n }],
  ]);
});
