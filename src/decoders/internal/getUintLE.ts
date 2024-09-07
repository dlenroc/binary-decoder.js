import type { Decoder } from '../../BinaryDecoder.ts';

export function* getUintLE(byteLength: number): Decoder<never, number> {
  let value = 0;
  let shift = -8;

  let chunk;
  do {
    chunk = yield -byteLength;
    for (let byte of chunk) value |= byte << (shift += 8);
  } while ((byteLength -= chunk.length));

  return value;
}
