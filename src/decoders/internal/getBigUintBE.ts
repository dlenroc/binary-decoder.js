import type { Decoder } from '../../BinaryDecoder.ts';

export function* getBigUintBE(): Decoder<never, bigint> {
  let value = 0n;
  let byteLength = 8;

  let chunk;
  do {
    chunk = yield -byteLength;
    for (let byte of chunk) {
      value = (value << 8n) | BigInt(byte);
    }
  } while ((byteLength -= chunk.length));

  return value;
}
