import type { Decoder } from '../BinaryDecoder.ts';
import { getBigUint64 } from './getBigUint64.ts';

export function* getFloat64(littleEndian?: boolean): Decoder<never, number> {
  const value = yield* getBigUint64(littleEndian);

  const sign = value >> 63n ? -1 : 1;
  const exponent = Number((value >> 52n) & 0x7ffn);
  const fraction = Number(value & 0xfffffffffffffn);

  if (exponent === 0x7ff) {
    return fraction ? NaN : sign * Infinity;
  }

  if (exponent === 0) {
    return ((sign * fraction) / 2 ** 52) * 2 ** -1022;
  }

  return sign * 2 ** (exponent - 1023) * (fraction / 2 ** 52 + 1);
}
