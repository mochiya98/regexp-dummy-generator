import { CharClassItem, CharClassType } from "../types";

const CODE_A = 0x41; // 'A'
const CODE_Z = 0x5a; // 'Z'
const CODE_a = 0x61; // 'a'
const CODE_z = 0x7a; // 'z'
const CODE_0 = 0x30; // '0'
const CODE_9 = 0x39; // '9'

export const whitespaceRange: CharClassItem[] =
  "\f\n\r\t\v\u0020\u00a0\u1680\u2028\u2029\u202f\u205f\u3000\ufeff"
    .split("")
    .map((value) => ({
      _type: CharClassType.Char,
      _cp: value.codePointAt(0)!,
    }));
whitespaceRange.splice(8, 0, {
  _type: CharClassType.Range,
  _start: 0x2000,
  _end: 0x200a,
});

export const digitRange: CharClassItem[] = [
  { _type: CharClassType.Range, _start: CODE_0, _end: CODE_9 },
];

export const wordRange: CharClassItem[] = [
  { _type: CharClassType.Range, _start: CODE_A, _end: CODE_Z },
  { _type: CharClassType.Range, _start: CODE_a, _end: CODE_z },
  { _type: CharClassType.Range, _start: CODE_0, _end: CODE_9 },
  { _type: CharClassType.Char, _cp: 0x5f }, // '_'
];

export const nonDotRange: CharClassItem[] = [
  { _type: CharClassType.Char, _cp: 0x0a }, // '\n'
  { _type: CharClassType.Char, _cp: 0x0d }, // '\r'
  { _type: CharClassType.Char, _cp: 0x2028 },
  { _type: CharClassType.Char, _cp: 0x2029 },
];

// U+D800 - U+DB7F High Surrogate
// U+DB80 - U+DBFF High Private Use Surrogate
// U+DC00 - U+DFFF Low Surrogate
export const surrogateRange: CharClassItem[] = [
  {
    _type: CharClassType.Range,
    _start: 0xd800,
    _end: 0xdfff,
  },
];
