import { expect, test, describe } from "vitest";
import { genCharFromCharClass } from "@/charClass";

describe("genCharFromCharClass", () => {
  test("invalid unicode-class escape", () => {
    expect(() =>
      genCharFromCharClass("\\p{Foo=Bar}", false, true, false, false)
    ).toThrow("Unicode property escapes \\p{Foo=Bar} is not supported");
  });
});
