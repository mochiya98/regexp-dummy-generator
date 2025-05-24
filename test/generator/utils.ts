import { newDummyGenerator } from "@/generator";
import { RegExpDummyGeneratorOptions } from "@/index";
import { test, expect } from "vitest";

export type TestGeneratorRegExpPattern = {
  title: string;
  regExp: RegExp;
  repeat?: number;
};

export const testGeneratorRegExpPatterns = (
  patterns: TestGeneratorRegExpPattern[],
  options?: RegExpDummyGeneratorOptions
) => {
  patterns.forEach(({ title, regExp, repeat = 1 }) => {
    const matchRegExp = new RegExp(`^${regExp.source}$`, regExp.flags);
    test(title, () => {
      const dummy = newDummyGenerator(regExp, {
        allLettersRangeClass: "\\x20-\\x7e",
        ...options,
      });
      for (let i = 0; i < repeat; ++i) {
        expect(dummy()).toMatch(matchRegExp);
      }
    });
  });
};
