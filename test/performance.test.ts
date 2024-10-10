import { describe, it } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { BinaryDecoder } from '../src/BinaryDecoder.ts';

describe('performance', () => {
  const decoder = new BinaryDecoder(function* () {
    while (true) {
      const [type] = yield 1;

      const chunks: Uint8Array[] = [];
      let bytes: Uint8Array;
      let terminatorIndex: number;
      while (true) {
        bytes = yield -Infinity;
        terminatorIndex = bytes.indexOf(0);
        if (terminatorIndex !== -1) {
          chunks.push(bytes.subarray(0, terminatorIndex));
          break;
        }

        chunks.push(bytes);
      }

      yield bytes.subarray(terminatorIndex + 1);

      yield { type, chunks };
    }
  });

  it('throughput in ops/ms', async (ctx) => {
    const iterations = 1_000;
    const decodeIterations = 10_000;
    const chunks = [
      Uint8Array.of(1, 2, 3),
      Uint8Array.of(4, 0, 5),
      Uint8Array.of(6, 7, 8),
    ];

    const results = [];
    for (let i = 0; i < iterations; i++) {
      const now = performance.now();
      for (let j = 0; j < decodeIterations; j++) {
        for (const chunk of chunks) {
          [...decoder.decode(chunk)];
        }
      }
      results.push(~~(decodeIterations / (performance.now() - now)));
      await delay();
    }

    const max = Math.max(...results);
    const min = Math.min(...results);
    const p95 = results.sort((a, b) => a - b)[~~(results.length * 0.95)];
    ctx.diagnostic(`P95: ${p95}, Min: ${min}, Max: ${max}`);
  });
});
