import { CharClassType } from "@/types";
import { decodeBERBinary, encodeBERBinary } from "@/unicode/ber";
import { decodeRanges, encodeCodePoints } from "@/unicode/rangeUtils";
import { describe, expect, test } from "vitest";

describe("encodeCodePoints", () => {
  test("should encode correctly", () => {
    const encoded = encodeCodePoints([0x03, 0x04, 0x05, 0x61, 0x7a]);
    expect(encoded).toEqual([0x07, 0x02, 0xbc, 0x32]);
  });
});

describe("decodeRanges", () => {
  test("should decode correctly", () => {
    const decoded = decodeRanges(
      decodeBERBinary(encodeBERBinary([[0x07, 0x02, 0xbc, 0x32]]))
    );
    expect(decoded).toEqual([
      [
        {
          _type: CharClassType.Range,
          _start: 0x03,
          _end: 0x05,
        },
        {
          _type: CharClassType.Char,
          _cp: 0x61, // "a"
        },
        {
          _type: CharClassType.Char,
          _cp: 0x7a, // "z"
        },
      ],
    ]);
  });
});
