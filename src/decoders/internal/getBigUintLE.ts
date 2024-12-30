import type { Decoder } from '../../BinaryDecoder.ts';

export function* getBigUintLE(): Decoder<never, bigint> {
  let value = 0n;
  let shift = -8n;
  let byteLength = 8;

  let chunk;
  do {
    chunk = yield -byteLength;
    for (let byte of chunk) {
      value |= BigInt(byte) << (shift += 8n);
    }
  } while ((byteLength -= chunk.length));

  return value;
}
