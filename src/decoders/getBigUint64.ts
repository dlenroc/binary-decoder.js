import type { Decoder } from '../BinaryDecoder.ts';
import { getBigUintBE } from './internal/getBigUintBE.ts';
import { getBigUintLE } from './internal/getBigUintLE.ts';

export function getBigUint64(littleEndian?: boolean): Decoder<never, bigint> {
  return littleEndian ? getBigUintLE() : getBigUintBE();
}
