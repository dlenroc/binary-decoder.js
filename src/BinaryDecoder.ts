export type Decoder<T = never, TReturn = void> = Generator<
  number | ArrayBufferView | T,
  TReturn,
  Uint8Array
>;

export class BinaryDecoder<T = never> {
  #bytesNeeded = 0;
  #byteLength = 0;
  #decoder: Decoder<T>;
  #queue: {
    buffer: ArrayBuffer;
    byteOffset: number;
    byteLength: number;
  }[] = [];

  constructor(decoder: () => Decoder<T>) {
    this.#decoder = decoder();
  }

  decode(input: ArrayBufferView): IteratorObject<T, undefined, undefined> {
    if (input.byteLength > 0) {
      this.#byteLength += input.byteLength;
      this.#queue.unshift({
        buffer: input.buffer,
        byteOffset: input.byteOffset,
        byteLength: input.byteLength,
      });
    }

    return this[Symbol.iterator]();
  }

  close(): Uint8Array[] {
    const buffers = [];

    let frame;
    while ((frame = this.#queue.pop())) {
      buffers.push(
        new Uint8Array(frame.buffer, frame.byteOffset, frame.byteLength)
      );
    }

    this.#decoder.return();
    return buffers;
  }

  *[Symbol.iterator](): IteratorObject<T, undefined, undefined> {
    while (this.#byteLength >= this.#bytesNeeded) {
      let view: Uint8Array;

      if (this.#bytesNeeded === 0) {
        view = new Uint8Array(0);
      } else {
        const frame = this.#queue.pop();
        if (frame === undefined) {
          break;
        }

        if (this.#bytesNeeded > frame.byteLength) {
          this.#byteLength -= this.#bytesNeeded;
          this.#queue.push(frame);
          view = new Uint8Array(this.#bytesNeeded);

          let offset = 0;
          while (this.#bytesNeeded > 0) {
            const nextFrame = this.#queue.pop()!;
            const length = Math.min(nextFrame.byteLength, this.#bytesNeeded);
            view.set(
              new Uint8Array(nextFrame.buffer, nextFrame.byteOffset, length),
              offset
            );

            offset += length;
            this.#bytesNeeded -= length;

            if (nextFrame.byteLength > length) {
              nextFrame.byteOffset += length;
              nextFrame.byteLength -= length;
              this.#queue.push(nextFrame);
            }
          }
        } else {
          if (this.#bytesNeeded < 0) {
            this.#bytesNeeded = Math.min(-this.#bytesNeeded, frame.byteLength);
          }

          this.#byteLength -= this.#bytesNeeded;
          view = new Uint8Array(
            frame.buffer,
            frame.byteOffset,
            this.#bytesNeeded
          );

          if (frame.byteLength > this.#bytesNeeded) {
            frame.byteOffset += this.#bytesNeeded;
            frame.byteLength -= this.#bytesNeeded;
            this.#queue.push(frame);
          }
        }
      }

      const { done, value } = this.#decoder.next(view);
      if (done) {
        this.#bytesNeeded = 0;
        return;
      }

      if (typeof value === 'number') {
        this.#bytesNeeded = value;
      } else if (ArrayBuffer.isView(value)) {
        this.#bytesNeeded = 0;

        const nextFrame = this.#queue[this.#queue.length - 1];
        if (
          nextFrame !== undefined &&
          nextFrame.buffer === value.buffer &&
          nextFrame.byteOffset === value.byteOffset + value.byteLength
        ) {
          this.#byteLength += value.byteLength;
          nextFrame.byteOffset = value.byteOffset;
          nextFrame.byteLength += value.byteLength;
        } else {
          this.#byteLength += value.byteLength;
          this.#queue.push({
            buffer: value.buffer,
            byteOffset: value.byteOffset,
            byteLength: value.byteLength,
          });
        }
      } else {
        this.#bytesNeeded = 0;
        yield value;
      }
    }
  }
}
