# @dlenroc/binary-decoder · [![NPM Version](https://img.shields.io/npm/v/@dlenroc/binary-decoder)](https://www.npmjs.com/package/@dlenroc/binary-decoder)

A lightweight library for implementing incremental binary data parsers using generators.

## Installation

```sh
npm install @dlenroc/binary-decoder
```

## Usage

The `yield` syntax allows parsers to:

- **Request Data**: `yield N` reads `N` bytes; `yield -N` reads up to `|N|` bytes, with a minimum of 1 byte.
- **Push Back Data**: `yield ArrayBufferView` (e.g., `Uint8Array`) returns bytes to the buffer.
- **Produce Results**: `yield <other>` adds data to the final result.

> 🚨 `yield N` returns a view of the input passed to `decode`,
> making a copy only if multiple chunks are needed to satisfy the request.

```ts
import { BinaryDecoder } from '@dlenroc/binary-decoder';

const decoder = new BinaryDecoder(function* () {
  // ✨ N ≥ 0 | Read exactly N bytes.
  const fixedLengthBytes: Uint8Array = yield 2;

  // ✨ N < 0 | Read at most |N| bytes, at least 1 byte.
  const variableLengthBytes: Uint8Array = yield -2;

  // ✨ ArrayBufferView | Pushback bytes to the internal buffer.
  yield Uint8Array.of(40, 50);

  // ✨ Other | Enqueue parsed data.
  yield { fixedLengthBytes, variableLengthBytes, extraBytes: yield -Infinity };
});

console.log(decoder.decode(Uint8Array.of(10, 20, 30)));
// [
//   {
//     fixedLengthBytes: Uint8Array(2) [ 10, 20 ],
//     variableLengthBytes: Uint8Array(1) [ 30 ],
//     extraBytes: Uint8Array(2) [ 40, 50 ]
//   }
// ]
```

### Stateful Parsing

Suppose we need to parse a simple protocol defined as follows:

| No. of bytes | Type [Value] | Description  |
| ------------ | ------------ | ------------ |
| 1            | U8 [1]       | message-type |
| 4            | U32          | length       |
| length       | U8 array     | text         |

```ts
import { BinaryDecoder, type Decoder } from '@dlenroc/binary-decoder';

type Echo = { type: 1; text: String };

function* parse(): Decoder<Echo> {
  while (true) {
    const [type] = yield 1;
    switch (type) {
      case 1:
        yield* parseEcho();
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }
}

function* parseEcho(): Decoder<Echo> {
  const bytes = yield 4;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = new TextDecoder().decode(yield view.getUint32(0));
  yield { type: 1, text };
}

const decoder = new BinaryDecoder(parse);

// create a message
const textBytes = new TextEncoder().encode('Hello, World!');
const chunk = new Uint8Array(5 + textBytes.byteLength);
const view = new DataView(chunk.buffer);
view.setUint8(0, 1);
view.setUint32(1, textBytes.byteLength);
chunk.set(textBytes, 5);

// [1] Parse a message
console.log(decoder.decode(chunk));
// [
//   { type: 1, text: 'Hello, World!' }
// ]

// [2] Parse multiple messages
console.log(decoder.decode(Uint8Array.of(...chunk, ...chunk)));
// [
//   { type: 1, text: 'Hello, World!' },
//   { type: 1, text: 'Hello, World!' }
// ]

// [3] Parse a message split across chunks
console.log(decoder.decode(chunk.subarray(0, 3)));
// []
console.log(decoder.decode(chunk.subarray(3, 5)));
// []
console.log(decoder.decode(chunk.subarray(5)));
// [
//   { type: 1, text: 'Hello' }
// ]
```

### Handling Large Messages

In the [Stateful Parsing](#stateful-parsing) example, the Echo message’s text
length is encoded as a U32, which can represent sizes up to 4.29 GB.
For processing such large messages, streaming is more practical than buffering
the entire message in memory.

Here’s how to implement streaming for large messages:

```ts
type Echo = { type: 1; text: ReadableStream<string> };

function* parseEcho(): Decoder<Echo> {
  const textDecoderStream = new TextDecoderStream();
  const writer = textDecoderStream.writable.getWriter();

  try {
    yield { type: 1, text: textDecoderStream.readable };

    const bytes = yield 4;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let eta = view.getUint32(0);

    while (eta > 0) {
      const chunk = yield -eta;
      writer.write(chunk);
      eta -= chunk.byteLength;
    }
  } finally {
    writer.close();
  }
}

// ...

// [3] Parse a message split across chunks (streaming output)
console.log(decoder.decode(chunk.subarray(0, 3)));
// [
//   {
//     type: 1,
//     text: ReadableStream { locked: false, state: 'readable', supportsBYOB: false }
//   }
// ]
console.log(decoder.decode(chunk.subarray(3, 5)));
// []
console.log(decoder.decode(chunk.subarray(5)));
// []
```
