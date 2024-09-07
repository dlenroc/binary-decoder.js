import type { Decoder } from '../BinaryDecoder.ts';
import { getUint16 } from './getUint16.ts';
import { toInt } from './internal/toInt.ts';

export function* getInt16(littleEndian?: boolean): Decoder<never, number> {
  return toInt(yield* getUint16(littleEndian), 2);
}
