import type { Decoder } from '../BinaryDecoder.ts';

export function* getCString(encoding?: string): Decoder<never, string> {
  const decoder = new TextDecoder(encoding);

  let result = '';

  while (true) {
    const chunk = yield -Infinity;
    const nullIndex = chunk.indexOf(0);

    if (nullIndex === -1) {
      result += decoder.decode(chunk, { stream: true });
    } else {
      result += decoder.decode(chunk.subarray(0, nullIndex));
      yield chunk.subarray(nullIndex + 1);
      break;
    }
  }

  return result;
}
