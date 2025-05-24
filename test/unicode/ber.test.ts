import { expect, test, describe } from "vitest";
import { decodeBER, encodeBER, encodeBERBinary } from "@/unicode/ber";

describe("encodeBER", () => {
  test("should encode a number to BER", () => {
    const result = encodeBER(123456);
    expect(result).toEqual([0x87, 0xc4, 0x40]);
  });
});

describe("decodeBER", () => {
  test("should decode BER correctly", () => {
    const result = decodeBER(new Uint8Array([0x87, 0xc4, 0x40]), 0);
    expect(result).toEqual({ v: 123456, n: 3 });
  });
  test("should throw an error for invalid data", () => {
    expect(() => decodeBER(new Uint8Array([0xff, 0xff]), 0)).toThrow(
      "Invalid Data"
    );
  });
});

describe("encodeBERBinary", () => {
  test("should encode a binary array to BER", () => {
    const result = encodeBERBinary([
      [12345, 67],
      [89, 54321],
    ]);
    expect(result).toEqual(
      new Uint8Array([0x02, 0xe0, 0x39, 0x43, 0x02, 0x59, 0x83, 0xa8, 0x31])
    );
  });
});
