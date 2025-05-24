import { expect, test, describe } from "vitest";
import { charTokenToCodePoint } from "@/charToken";

describe("charTokenToCodePoint", () => {
  test("normal", () => {
    expect(charTokenToCodePoint("a")).toBe("a".codePointAt(0));
    expect(charTokenToCodePoint("あ")).toBe("あ".codePointAt(0));
  });
  test("caret notation", () => {
    expect(charTokenToCodePoint("\\cC")).toBe(0x03);
  });
  test("hex", () => {
    expect(charTokenToCodePoint("\\x41")).toBe(0x41);
  });
  test("unicode(fixed)", () => {
    expect(charTokenToCodePoint("\\u3042")).toBe(0x3042);
  });
  test("unicode(flex)", () => {
    expect(charTokenToCodePoint("\\u{f}")).toBe(0xf);
    expect(charTokenToCodePoint("\\u{ff}")).toBe(0xff);
    expect(charTokenToCodePoint("\\u{fff}")).toBe(0xfff);
    expect(charTokenToCodePoint("\\u{ffff}")).toBe(0xffff);
    expect(charTokenToCodePoint("\\u{1F600}")).toBe(0x1f600);
    expect(charTokenToCodePoint("\\u{100f00}")).toBe(0x100f00);
  });
  test("other escapes", () => {
    expect(charTokenToCodePoint("\\n")).toBe(0x0a);
    expect(charTokenToCodePoint("\\t")).toBe(0x09);
    expect(charTokenToCodePoint("\\r")).toBe(0x0d);
    expect(charTokenToCodePoint("\\v")).toBe(0x0b);
    expect(charTokenToCodePoint("\\f")).toBe(0x0c);
  });
});
