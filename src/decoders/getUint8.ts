import type { Decoder } from '../BinaryDecoder.ts';

export function* getUint8(): Decoder<never, number> {
  return (yield 1)[0]!;
}
