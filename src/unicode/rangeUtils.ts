import { CharClassItem, CharClassType } from "../types";

export const encodeCodePoints = (arr: number[]) => {
  let result: number[] = [];
  let i = 0;
  let befStart = 0;
  arr = arr.toSorted((a, b) => a - b);

  while (i < arr.length) {
    let start = arr[i];
    let continuous = 0;
    while (i + 1 < arr.length && arr[i + 1] === arr[i] + 1) {
      continuous++;
      i++;
    }
    const relStart = start - befStart;
    if (continuous === 0) {
      result.push(((relStart << 1) | 0) >>> 0);
    } else {
      result.push(((relStart << 1) | 1) >>> 0, continuous);
    }
    befStart = start;
    i++;
  }

  return result;
};

export const decodeRanges = (data: number[][]) =>
  data.map((raw) => {
    const charClasses: CharClassItem[] = [];
    let befStart = 0;
    for (let i = 0; i < raw.length; i++) {
      const relStart = raw[i] >> 1;
      const start = relStart + befStart;
      befStart = start;
      if (raw[i] & 1) {
        charClasses.push({
          _type: CharClassType.Range,
          _start: start,
          _end: start + raw[i + 1],
        });
        i += 1;
      } else {
        charClasses.push({
          _type: CharClassType.Char,
          _cp: start,
        });
      }
    }
    return charClasses;
  });
