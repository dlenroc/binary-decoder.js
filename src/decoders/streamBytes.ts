import type { Decoder } from '../BinaryDecoder.ts';

export function* streamBytes(
  byteLength: number,
  enqueue: (chunk: Uint8Array) => void
): Decoder {
  while (byteLength > 0) {
    const chunk = yield -byteLength;
    byteLength -= chunk.length;
    enqueue(chunk);
  }
}
