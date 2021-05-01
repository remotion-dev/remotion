export const toInt16 = (x: number) => (x > 0 ? x * 0x7fff : x * 0x8000);
