import type { Decoder } from '../BinaryDecoder.ts';

export function* streamBytesUntil(
  pattern: ArrayLike<number>,
  enqueue: (chunk: Uint8Array) => void
): Decoder {
  let chunk;
  let chunkIndex;
  let patternIndex;
  let patternRemainingLength;
  let nextChunk;
  let bufferedChunks;
  let bufferedByteLength;

  while (true) {
    chunk = yield -Infinity;
    chunkIndex = -1;

    while ((chunkIndex = chunk.indexOf(pattern[0]!, ++chunkIndex)) !== -1) {
      bufferedChunks = [];
      bufferedByteLength = 0;

      patternIndex = 1;
      patternRemainingLength = pattern.length - 1;
      nextChunk = chunk.subarray(
        chunkIndex + 1,
        chunkIndex + 1 + patternRemainingLength
      );

      match: while (true) {
        for (let i = 0; i < nextChunk.length; i++) {
          if (nextChunk[i] !== pattern[patternIndex++]) {
            while ((nextChunk = bufferedChunks.pop()!)) {
              yield nextChunk;
            }

            break match;
          }
        }

        if ((patternRemainingLength -= nextChunk.length) === 0) {
          if (chunkIndex > 0) {
            enqueue(chunk.subarray(0, chunkIndex));
          }

          if (chunk.byteLength > (chunkIndex += pattern.length)) {
            yield chunk.subarray(chunkIndex);
          }

          return;
        }

        nextChunk = yield -patternRemainingLength;
        bufferedChunks.push(nextChunk);
        bufferedByteLength += nextChunk.byteLength;
      }
    }

    enqueue(chunk);
  }
}
