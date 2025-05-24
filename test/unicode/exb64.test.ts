import { decodeExb64, encodeExb64 } from "@/unicode/exb64";
import { describe, expect, test } from "vitest";

const CRYPTO_RANDOM_MAX_SIZE = 65536;
const getDummyArray = (length: number) => {
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i += CRYPTO_RANDOM_MAX_SIZE) {
    const chunk = data.subarray(
      i,
      Math.min(i + CRYPTO_RANDOM_MAX_SIZE, length)
    );
    crypto.getRandomValues(chunk);
  }

  return data;
};

describe("encodeExb64 / decodeExb64", () => {
  test("should encode / decode correctly", () => {
    const src = getDummyArray(1024 * 100);
    const dst = decodeExb64(encodeExb64(src));
    expect(Buffer.from(src).equals(dst)).toBeTruthy();
  });
});
