import type { Decoder } from '../BinaryDecoder.ts';
import { getUintBE } from './internal/getUintBE.ts';
import { getUintLE } from './internal/getUintLE.ts';

export function getUint16(littleEndian?: boolean): Decoder<number, number> {
  return littleEndian ? getUintLE(2) : getUintBE(2);
}
