import { expect, test, describe } from "vitest";
import { strToCharTokens } from "@/charToken";

describe("strToCharTokens", () => {
  test("normal", () => {
    expect(strToCharTokens("abc", false)).toEqual(["a", "b", "c"]);
  });
  test("escaped", () => {
    expect(strToCharTokens("a\\nb", false)).toEqual(["a", "\\n", "b"]);
    expect(strToCharTokens("a\\cCb", false)).toEqual(["a", "\\cC", "b"]);
    expect(strToCharTokens("a\\cfb", false)).toEqual(["a", "\\cf", "b"]);
    expect(strToCharTokens("\\x41\\u3042", false)).toEqual([
      "\\x41",
      "\\u3042",
    ]);
    expect(strToCharTokens("ab\\u{1F600}cd", true)).toEqual([
      "a",
      "b",
      "\\u{1F600}",
      "c",
      "d",
    ]);
    expect(strToCharTokens("jkl\\p{Script=Hiragana}ref", false)).toEqual([
      ..."jkl\\p{Script=Hiragana}ref".match(/\\?./g)!,
    ]);
    expect(strToCharTokens("ab\\p{Script=Hiragana}cd", true)).toEqual([
      "a",
      "b",
      "\\p{Script=Hiragana}",
      "c",
      "d",
    ]);
  });
  test("escaped backslashes and escape sequences", () => {
    const patterns: string[] = [
      "a\\\\x41b",
      "a\\\\u3042b",
      "a\\\\u{1F600}b",
      "a\\\\p{Script=Hiragana}b",
    ];
    for (const ptn of patterns) {
      expect(strToCharTokens(ptn, !!ptn.match(/\\[up]/))).toEqual(
        Array.from(ptn.match(/\\\\|[\s\S]/g)!)
      );
    }
  });
});
