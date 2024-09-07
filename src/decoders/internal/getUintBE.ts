import type { Decoder } from '../../BinaryDecoder.ts';

export function* getUintBE(byteLength: number): Decoder<never, number> {
  let value = 0;

  let chunk;
  do {
    chunk = yield -byteLength;
    for (let byte of chunk) value = (value << 8) | byte;
  } while ((byteLength -= chunk.length));

  return value;
}
