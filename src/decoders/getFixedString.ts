import type { Decoder } from '../BinaryDecoder.ts';

export function* getFixedString(
  length: number,
  encoding?: string
): Decoder<never, string> {
  const decoder = new TextDecoder(encoding);

  let result = '';
  let byteLength = length;

  while (byteLength > 0) {
    const chunk = yield -byteLength;
    result += decoder.decode(chunk, { stream: true });
    byteLength -= chunk.byteLength;
  }

  return result;
}
