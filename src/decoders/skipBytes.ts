import type { Decoder } from '../BinaryDecoder.ts';

export function* skipBytes(byteLength: number): Decoder {
  while (byteLength > 0) {
    byteLength -= (yield -byteLength).byteLength;
  }
}
