import type { Decoder } from '../BinaryDecoder.ts';
import { getUint32 } from './getUint32.ts';

export function* getFloat32(littleEndian?: boolean): Decoder<never, number> {
  const value = yield* getUint32(littleEndian);

  const sign = value >> 31 ? -1 : 1;
  const exponent = (value >> 23) & 0xff;
  const fraction = value & 0x7fffff;

  if (exponent === 255) {
    return fraction ? NaN : sign * Infinity;
  }

  if (exponent === 0) {
    return sign * (fraction / 2 ** 23) * 2 ** -126;
  }

  return sign * 2 ** (exponent - 127) * (fraction / 2 ** 23 + 1);
}
