import type { Decoder } from '../BinaryDecoder.ts';
import { getUint32 } from './getUint32.ts';
import { toInt } from './internal/toInt.ts';

export function* getInt32(littleEndian?: boolean): Decoder<never, number> {
  return toInt(yield* getUint32(littleEndian), 4);
}
