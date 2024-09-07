import type { Decoder } from '../BinaryDecoder.ts';
import { getUintBE } from './internal/getUintBE.ts';
import { getUintLE } from './internal/getUintLE.ts';

export function getUint32(littleEndian?: boolean): Decoder<never, number> {
  return littleEndian ? getUintLE(4) : getUintBE(4);
}
