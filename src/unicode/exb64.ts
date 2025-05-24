const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz:#";
const CHAR_TO_VAL: { [key: string]: number } = {};
for (let i = 0; i < CHARSET.length; i++) {
  CHAR_TO_VAL[CHARSET[i]] = i;
}

export const encodeExb64 = (data: Uint8Array) => {
  const length = data.length;
  const buffer = new Uint8Array(4 + length);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, length, false);
  buffer.set(data, 4);

  let bitBuffer = 0;
  let bitCount = 0;
  let result = "";

  for (let i = 0; i < buffer.length; i++) {
    bitBuffer = (bitBuffer << 8) | buffer[i];
    bitCount += 8;

    while (bitCount >= 6) {
      bitCount -= 6;
      const index = (bitBuffer >> bitCount) & 0x3f;
      result += CHARSET[index];
    }
  }

  if (bitCount > 0) {
    const index = (bitBuffer << (6 - bitCount)) & 0x3f;
    result += CHARSET[index];
  }

  return result;
};

const new64bitReader = (encoded: string) => {
  let i = 0;
  let bitBuffer = 0;
  let bitCount = 0;
  return (length: number) => {
    let outIdx = 0;
    const out = new Uint8Array(length);
    while (i < encoded.length && outIdx < length) {
      const val = CHAR_TO_VAL[encoded[i++]];
      bitBuffer = (bitBuffer << 6) | val;
      bitCount += 6;
      while (bitCount >= 8 && outIdx < length) {
        bitCount -= 8;
        out[outIdx++] = (bitBuffer >> bitCount) & 0xff;
      }
    }
    return out;
  };
};

export const decodeExb64 = (encoded: string) => {
  const reader = new64bitReader(encoded);
  const header = reader(4);
  const dataLength =
    (header[0] << 24) | (header[1] << 16) | (header[2] << 8) | header[3];
  return reader(dataLength);
};
