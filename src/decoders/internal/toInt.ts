export function toInt(value: number, byteLength: number): number {
  const signMask = 1 << (byteLength * 8 - 1);
  if (value & signMask) {
    return value - (signMask << 1);
  }

  return value;
}
