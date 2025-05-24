import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  test("should includes some upperCase for class", () => {
    const dummy = newDummyGenerator(/[a-z]{48}/i);
    for (let i = 0; i < 5; ++i) {
      expect(dummy()).matches(/[A-Z]/);
    }
  });
  test("should includes some upperCase for literal", () => {
    const dummy = newDummyGenerator(/K{48}/iu);
    for (let i = 0; i < 5; ++i) {
      expect(dummy()).matches(/k/);
    }
  });
  testGeneratorRegExpPatterns(
    [
      {
        title: "should not include 'a' with ignoreCase",
        regExp: /[^a]{24}/i,
      },
      {
        title: "should not include 'a' with ignoreCase",
        regExp: /[^A]{24}/i,
      },
      {
        title: "should not transform characters without case distinction",
        regExp: /([@]{24})\1/i,
      },
      {
        title: "should handle class larger than ff5a with ignoreCase correctly",
        regExp: /[\uff5b-\uff5c]{24}/i,
      },
    ],
    {
      allLettersRangeClass: "aAb",
    }
  );
  testGeneratorRegExpPatterns(
    [
      {
        title: "should handle unicode characters with ignoreCase correctly",
        regExp: /[^\u017f]{24}/iu,
      },
    ],
    {
      allLettersRangeClass: "ASs\u017f",
    }
  );

  const kLetters: string[] = [
    "k",
    "\\u212a",
    "[k]",
    "[^k]",
    "[\\u212a]",
    "[^\\u212a]",
  ];
  testGeneratorRegExpPatterns(
    [
      ...kLetters.map((c) => ({
        title: `should handle correctly "${c}" with i flag`,
        regExp: new RegExp(c + "{24}", "i"),
      })),
      ...kLetters.map((c) => ({
        title: `should handle correctly "${c}" with iu flag`,
        regExp: new RegExp(c + "{24}", "iu"),
      })),
    ],
    {
      allLettersRangeClass: "Kk\u212a\u017f",
    }
  );
});
