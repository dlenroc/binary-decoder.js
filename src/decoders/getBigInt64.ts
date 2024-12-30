import type { Decoder } from '../BinaryDecoder.ts';
import { getBigUint64 } from './getBigUint64.ts';

export function* getBigInt64(littleEndian?: boolean): Decoder<never, bigint> {
  return BigInt.asIntN(64, yield* getBigUint64(littleEndian));
}
