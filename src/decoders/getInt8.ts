import type { Decoder } from '../BinaryDecoder.ts';
import { toInt } from './internal/toInt.ts';

export function* getInt8(): Decoder<never, number> {
  return toInt((yield 1)[0]!, 1);
}
