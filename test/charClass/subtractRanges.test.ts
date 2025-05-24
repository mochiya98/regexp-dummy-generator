import { expect, test, describe } from "vitest";
import { subtractRanges } from "@/charClass/subtractRanges";
import { CharClassType } from "@/types";

const CP_A = 0x41;
const CP_B = 0x42;
const CP_C = 0x43;
const CP_DANGO = 0x1f361; //

describe("subtractRanges", () => {
  test("should subtract ranges correctly", () => {
    expect(
      subtractRanges(
        [
          { _type: CharClassType.Range, _start: 40, _end: 100 },
          { _type: CharClassType.Range, _start: 110, _end: 300 },
          { _type: CharClassType.Char, _cp: CP_DANGO },
        ],
        [
          { _type: CharClassType.Range, _start: 49, _end: 50 },
          { _type: CharClassType.Range, _start: 97, _end: 122 },
          { _type: CharClassType.Char, _cp: 0xff },
        ]
      )
    ).toStrictEqual([
      {
        _end: 48,
        _start: 40,
        _type: CharClassType.Range,
      },
      {
        _end: 96,
        _start: 51,
        _type: CharClassType.Range,
      },
      {
        _end: 254,
        _start: 123,
        _type: CharClassType.Range,
      },
      {
        _end: 300,
        _start: 256,
        _type: CharClassType.Range,
      },
      {
        _type: CharClassType.Char,
        _cp: CP_DANGO,
      },
    ]);
  });
  test("should handle overlap boundary correctly", () => {
    expect(
      subtractRanges(
        [{ _type: CharClassType.Range, _start: 40, _end: 100 }],
        [{ _type: CharClassType.Range, _start: 100, _end: 103 }]
      )
    ).toStrictEqual([
      {
        _type: CharClassType.Range,
        _start: 40,
        _end: 99,
      },
    ]);
  });

  test("should handle char exclusion from range", () => {
    expect(
      subtractRanges(
        [{ _type: CharClassType.Range, _start: CP_A, _end: CP_C }],
        [{ _type: CharClassType.Char, _cp: CP_B }]
      )
    ).toStrictEqual([
      { _type: CharClassType.Char, _cp: CP_A },
      { _type: CharClassType.Char, _cp: CP_C },
    ]);
  });

  test("should handle char exclusion from char", () => {
    expect(
      subtractRanges(
        [
          { _type: CharClassType.Char, _cp: CP_A },
          { _type: CharClassType.Char, _cp: CP_B },
        ],
        [{ _type: CharClassType.Char, _cp: CP_B }]
      )
    ).toStrictEqual([{ _type: CharClassType.Char, _cp: CP_A }]);
  });

  test("should handle empty base", () => {
    expect(
      subtractRanges([], [{ _type: CharClassType.Range, _start: 1, _end: 10 }])
    ).toStrictEqual([]);
  });

  test("should handle empty excludes", () => {
    expect(
      subtractRanges([{ _type: CharClassType.Range, _start: 1, _end: 3 }], [])
    ).toStrictEqual([{ _type: CharClassType.Range, _start: 1, _end: 3 }]);
  });

  test("should handle full overlap", () => {
    expect(
      subtractRanges(
        [{ _type: CharClassType.Range, _start: 10, _end: 20 }],
        [{ _type: CharClassType.Range, _start: 10, _end: 20 }]
      )
    ).toStrictEqual([]);
  });

  test("should handle exclude range inside base range", () => {
    expect(
      subtractRanges(
        [{ _type: CharClassType.Range, _start: 10, _end: 20 }],
        [{ _type: CharClassType.Range, _start: 13, _end: 15 }]
      )
    ).toStrictEqual([
      { _type: CharClassType.Range, _start: 10, _end: 12 },
      { _type: CharClassType.Range, _start: 16, _end: 20 },
    ]);
  });

  test("should handle exclude range outside base range", () => {
    expect(
      subtractRanges(
        [{ _type: CharClassType.Range, _start: 10, _end: 20 }],
        [{ _type: CharClassType.Range, _start: 21, _end: 30 }]
      )
    ).toStrictEqual([{ _type: CharClassType.Range, _start: 10, _end: 20 }]);
  });

  test("should handle multiple overlapping ranges and chars", () => {
    expect(
      subtractRanges(
        [
          { _type: CharClassType.Range, _start: 1, _end: 5 },
          { _type: CharClassType.Char, _cp: CP_A },
          { _type: CharClassType.Char, _cp: CP_B },
        ],
        [
          { _type: CharClassType.Range, _start: 3, _end: 4 },
          { _type: CharClassType.Char, _cp: CP_A },
        ]
      )
    ).toStrictEqual([
      { _type: CharClassType.Range, _start: 1, _end: 2 },
      { _type: CharClassType.Char, _cp: 0x05 },
      { _type: CharClassType.Char, _cp: CP_B },
    ]);
  });
});
