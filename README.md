# @dlenroc/binary-decoder · [![NPM Version](https://img.shields.io/npm/v/@dlenroc/binary-decoder)](https://www.npmjs.com/package/@dlenroc/binary-decoder)

A library for implementing incremental binary data parsers using generators.

## Installation

```sh
npm install @dlenroc/binary-decoder
```

## Usage

The `BinaryDecoder` class enables streaming binary decoding using a generator
function. It leverages `yield` to read bytes, return unused data, and produce
the decoded result.

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

console.log([...decoder.decode(Uint8Array.of(10, 20, 30))]);
// [
//   {
//     fixedLengthBytes: Uint8Array(2) [ 10, 20 ],
//     variableLengthBytes: Uint8Array(1) [ 30 ],
//     extraBytes: Uint8Array(2) [ 40, 50 ]
//   }
// ]
```

## Examples

### Stateful Parsing

Suppose we need to parse a simple protocol defined as follows:

| No. of bytes | Type [Value] | Description |
| ------------ | ------------ | ----------- |
| 4            | U32          | length      |
| length       | U8 array     | text        |

```ts
import type { Decoder } from '@dlenroc/binary-decoder';
import { BinaryDecoder, getUint32 } from '@dlenroc/binary-decoder';

function* parse(): Decoder<string> {
  while (true) {
    const length = yield* getUint32();
    const bytes = yield length;

    yield new TextDecoder().decode(bytes);
  }
}

const decoder = new BinaryDecoder(parse);

// create a message
const textBytes = new TextEncoder().encode('Hello, World!');
const chunk = new Uint8Array([...new Uint8Array(4), ...textBytes]);
new DataView(chunk.buffer).setUint32(0, textBytes.byteLength);

// [1] Parse a message
console.log([...decoder.decode(chunk)]);
// [ 'Hello, World!' ]

// [2] Parse multiple messages
console.log([...decoder.decode(Uint8Array.of(...chunk, ...chunk))]);
// [ 'Hello, World!', 'Hello, World!' ]

// [3] Parse a message split across chunks
console.log([...decoder.decode(chunk.subarray(0, 3))]);
// []
console.log([...decoder.decode(chunk.subarray(3, 5))]);
// []
console.log([...decoder.decode(chunk.subarray(5))]);
// [ 'Hello, World!' ]
```

### Handling Large Messages

Update the decoder to stream decoded chunks directly, avoiding buffering.

```ts
import { getUint32, streamBytes } from '@dlenroc/binary-decoder';

function* parse(): Decoder<TextDecoderStream> {
  while (true) {
    const length = yield* getUint32();
    const stream = new TextDecoderStream();
    const writer = stream.writable.getWriter();

    try {
      yield stream;
      yield* streamBytes(length, (chunk) => writer.write(chunk));
    } finally {
      writer.close();
    }
  }
}

// ... 👀 See previous example

// [3] Parse a message split across chunks (streaming output)
console.log([...decoder.decode(chunk.subarray(0, 3))]);
// []
console.log([...decoder.decode(chunk.subarray(3, 5))]);
// [ TextDecoderStream { ... } ]
console.log([...decoder.decode(chunk.subarray(5))]);
// []
```
