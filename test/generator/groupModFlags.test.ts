import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns(
    [
      {
        title: "DotAll flag applies only within the group",
        regExp: /(?s:.{10}).{10}/,
        repeat: 10,
      },
      {
        title: "DotAll flag is disabled only within the group",
        regExp: /(?-s:.{10}).{10}/s,
        repeat: 10,
      },
    ],
    {
      allLettersRangeClass: "a\r\n\u2028\u2029",
    }
  );
  testGeneratorRegExpPatterns([
    {
      title: "IgnoreCase flag applies only within the group",
      regExp: /(?i:a{10})a{10}/,
      repeat: 10,
    },
    {
      title: "IgnoreCase flag is disabled only within the group",
      regExp: /(?-i:a{10})a{10}/i,
      repeat: 10,
    },
    {
      title: "should handle modify flags group as non-capturing group",
      regExp: /(aa)(?i:bb)(cc)\1\2/,
      repeat: 10,
    },
  ]);
  test("should generate upperCase letters when IgnoreCase flag is set within the group", () => {
    const dummy = newDummyGenerator(/(?i:a{64})a{64}/);
    const generated = dummy();
    expect(generated.slice(0, 64)).toMatch(/[a-z]+[A-Z]/);
    expect(generated.slice(64)).toMatch(/^[a-z]{64}$/);
  });
  test("should generate upperCase letters when IgnoreCase flag is set within the group and backref", () => {
    const dummy = newDummyGenerator(/(a{64})(?i:\1)/);
    const generated = dummy();
    expect(generated).toMatch(/(a{64})(?i:\1)/);
    expect(generated.slice(0, 64)).toMatch(/^[a-z]{64}$/);
    expect(generated.slice(64)).toMatch(/[a-z]+[A-Z]/);
  });
  test("should not generate upperCase letters when IgnoreCase flag is disabled within the group", () => {
    const dummy = newDummyGenerator(/(?-i:a{64})a{64}/i);
    const generated = dummy();
    expect(generated.slice(0, 64)).toMatch(/^[a-z]{64}$/);
    expect(generated.slice(64)).toMatch(/[a-z]+[A-Z]/);
  });
});
