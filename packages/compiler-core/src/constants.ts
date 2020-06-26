export const BINARY_MASKS = {
  0x1: (0x2 << 0x7) - 0x1,
  0x2: (0x2 << 0xF) - 0x1,
  0x4: ((0x2 << 0x1F) - 0x1) >>> 0,
};
