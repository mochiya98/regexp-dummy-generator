export const encodeBER = (num: number) => {
  const bytes = [];
  do {
    let byte = num & 0x7f;
    num >>= 7;
    if (bytes.length > 0) byte |= 0x80;
    bytes.unshift(byte);
  } while (num > 0);
  return bytes;
};

export const encodeBERBinary = (data: number[][]) => {
  const result: number[] = [];
  for (const arr of data) {
    result.push(...encodeBER(arr.length));
    for (const num of arr) {
      result.push(...encodeBER(num));
    }
  }

  return Uint8Array.from(result);
};

export const decodeBER = (bytes: Uint8Array, startIndex = 0) => {
  let v = 0;
  let n = startIndex;
  while (n < bytes.length) {
    const byte = bytes[n++];
    v = (v << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) {
      return { v, n };
    }
  }
  throw new Error("Invalid Data");
};

export const decodeBERBinary = (src: Uint8Array) => {
  const result: number[][] = [];
  let i = 0;

  while (i < src.length) {
    const { v, n } = decodeBER(src, i);
    i = n;
    const arr: number[] = [];
    for (let j = 0; j < v; j++) {
      const { v, n } = decodeBER(src, i);
      arr.push(v);
      i = n;
    }

    result.push(arr);
  }

  return result;
};
