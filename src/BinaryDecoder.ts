type Yield<T = never> = number | ArrayBufferView | T;
type DecodedEntry<T> = [T] extends [never] ? unknown[] : T[];
type DecoderResult<T> = IteratorResult<DecodedEntry<T>, DecodedEntry<T>>;
type DecoderCloseResult<T> = { buffers: Uint8Array[]; value: DecodedEntry<T> };

export type Decoder<T> = Generator<Yield<T>, void, Uint8Array>;

export class BinaryDecoder<T = never> {
  #byteLength = 0;
  #bytesNeeded = 0;
  #decoder: Decoder<T>;
  #done = false;
  #results: T[] = [];
  #stack: Pick<Uint8Array, 'buffer' | 'byteOffset' | 'byteLength'>[] = [];

  constructor(decoder: () => Decoder<T>) {
    this.#decoder = decoder();
  }

  close(): DecoderCloseResult<T> {
    const buffers = [];

    let frame;
    while ((frame = this.#stack.pop())) {
      buffers.push(
        new Uint8Array(frame.buffer, frame.byteOffset, frame.byteLength)
      );
    }

    this.#decoder.return();

    const value = this.#results;
    this.#results = [];
    return { buffers, value };
  }

  decode(input: ArrayBufferView): DecoderResult<T> {
    const results: T[] = this.#results;

    let frame = {
      buffer: input.buffer,
      byteOffset: input.byteOffset,
      byteLength: input.byteLength,
    };

    if (input.byteLength !== 0) {
      this.#byteLength += input.byteLength;
      if (this.#stack.length !== 0) {
        const topFrame = this.#stack.pop()!;
        this.#stack.unshift(frame);
        frame = topFrame;
      }
    }

    let result;
    while (this.#byteLength >= this.#bytesNeeded) {
      if (this.#bytesNeeded < 0) {
        if (frame.byteLength === 0) break;
        this.#bytesNeeded = Math.min(-this.#bytesNeeded, frame.byteLength);
      } else if (frame.byteLength < this.#bytesNeeded) {
        this.#stack.push(frame);

        const bytes = new Uint8Array(this.#bytesNeeded);
        frame = { buffer: bytes.buffer, byteOffset: 0, byteLength: 0 };

        let topFrame;
        let topFrameOffset = 0;
        do {
          topFrame = this.#stack.pop()!;
          topFrameOffset = Math.min(
            topFrame.byteLength,
            this.#bytesNeeded - frame.byteLength
          );

          bytes.set(
            new Uint8Array(
              topFrame.buffer,
              topFrame.byteOffset,
              topFrameOffset
            ),
            frame.byteLength
          );
        } while ((frame.byteLength += topFrameOffset) < this.#bytesNeeded);

        if (topFrameOffset < topFrame.byteLength) {
          this.#stack.push({
            buffer: topFrame.buffer,
            byteOffset: topFrame.byteOffset + topFrameOffset,
            byteLength: topFrame.byteLength - topFrameOffset,
          });
        }
      }

      try {
        result = this.#decoder.next(
          new Uint8Array(frame.buffer, frame.byteOffset, this.#bytesNeeded)
        );
      } catch (error) {
        this.#stack.push(frame);
        throw error;
      }

      this.#byteLength -= this.#bytesNeeded;
      frame.byteOffset += this.#bytesNeeded;
      frame.byteLength -= this.#bytesNeeded;

      if (result.done) {
        this.#done = true;
        break;
      }

      if (typeof result.value === 'number') {
        this.#bytesNeeded = result.value;
      } else if (ArrayBuffer.isView(result.value)) {
        this.#byteLength += result.value.byteLength;
        this.#bytesNeeded = 0;

        if (
          result.value.buffer === frame.buffer &&
          result.value.byteOffset + result.value.byteLength === frame.byteOffset
        ) {
          frame.byteLength += result.value.byteLength;
          frame.byteOffset = result.value.byteOffset;
        } else {
          if (frame.byteLength > 0) {
            this.#stack.push(frame);
          }

          frame = {
            buffer: result.value.buffer,
            byteOffset: result.value.byteOffset,
            byteLength: result.value.byteLength,
          };
        }
      } else {
        this.#bytesNeeded = 0;

        results.push(result.value);
      }

      if (frame.byteLength == 0 && this.#byteLength > 0) {
        frame = this.#stack.pop()!;
      }
    }

    if (frame.byteLength > 0) {
      this.#stack.push(frame);
    }

    this.#results = [];
    return { done: this.#done, value: results };
  }
}
