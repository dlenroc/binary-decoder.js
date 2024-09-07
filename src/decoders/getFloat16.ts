import type { Decoder } from '../BinaryDecoder.ts';
import { getUint16 } from './getUint16.ts';

export function* getFloat16(littleEndian?: boolean): Decoder<never, number> {
  const value = yield* getUint16(littleEndian);

  const sign = value >> 15 ? -1 : 1;
  const exponent = (value >> 10) & 0x001f;
  const mantissa = value & 0x03ff;

  if (exponent === 0) {
    return mantissa === 0 ? sign * 0 : sign * 2 ** -14 * (mantissa / 2 ** 10);
  }

  if (exponent === 0x1f) {
    return mantissa === 0 ? sign * Infinity : NaN;
  }

  return sign * 2 ** (exponent - 15) * (1 + mantissa / 2 ** 10);
}
