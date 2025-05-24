import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns([
    { title: "Lowercase letters", regExp: /[a-g]{64}/ },
    { title: "Uppercase letters", regExp: /[j-v]{64}/ },
    { title: "Digits", regExp: /[0-9]{64}/ },
    { title: "Mixed", regExp: /[A-Fd-y0-9]{64}/ },
    { title: "Escaped digits", regExp: /[\d]{64}/ },
    { title: "Word characters", regExp: /[\w]{64}/ },
    { title: "Whitespace characters", regExp: /[\s]{64}/ },
    { title: "Non-digits", regExp: /[\D]{64}/ },
    { title: "Non-word characters", regExp: /[\W]{64}/ },
    { title: "Non-whitespace characters", regExp: /[\S]{64}/ },
    { title: "Hexadecimal characters", regExp: /[a-fA-F0-9]{64}/ },
    { title: "Uppercase, digits, and underscore", regExp: /[A-Z0-9_]{64}/ },
    { title: "Lowercase letters and '-'", regExp: /[a-z-]{64}/ },
    { title: "Tab, newline, carriage return, space", regExp: /[\t\n\r ]{64}/ },
    { title: "Caret notation", regExp: /[\cC-\cF]{64}/ },
    { title: "Lower caret notation", regExp: /[\cc-\cf]{64}/ },
    { title: "hex escaped range", regExp: /[\x41-\x43]{64}/ },
    { title: "unicode escaped range", regExp: /[\u0041-\u0043]{64}/ },
    { title: "Digits or A-F", regExp: /[\dA-F]{64}/ },
    { title: "Unicode range", regExp: /[\u{1F630}\u{1F600}-\u{1F604}]{64}/u },
    { title: "Escaped hyphen", regExp: /[_\-z]{64}/ },
    {
      title: "Adjacent character ranges in char class",
      regExp: /[a-cd-f]{64}/,
    },
  ]);
  testGeneratorRegExpPatterns([
    {
      title: "multiple character class",
      regExp: /[a-z][0-9]/,
      repeat: 10,
    },
    {
      title: "\\xFF in group",
      regExp: /[\x41-\x5a]{5}/,
      repeat: 5,
    },
    {
      title: "unicode in group (without u flag)",
      regExp: /[🍡]{5}/,
    },
    {
      title: "unicode in group (with u flag)",
      regExp: /[🍡]{5}/u,
    },
    {
      title: "negate empty character class",
      regExp: /[^]{5}/,
      repeat: 5,
    },
    {
      // Hangul Jamo Extended-B ~ Surrogates ~ Private Use Area
      title: "should includes surrogate pairs when not u flagged",
      regExp: /[\uD7B0-\uF8FF]{500}/,
      repeat: 50,
    },
    {
      // Hangul Jamo Extended-B ~ Surrogates ~ Private Use Area
      title: "should exclude surrogate pairs when u flagged",
      regExp: /[\uD7B0-\uF8FF]{500}/u,
      repeat: 50,
    },
    {
      title: "control char escape (valid)",
      regExp: /[\cA]/,
    },
    {
      title: "control char escape (invaid)",
      //@ts-ignore
      regExp: /[\c%]/,
      repeat: 50,
    },
  ]);

  test("dot inside character class", () => {
    const dummy = newDummyGenerator(/[.]{10}/);
    for (let i = 0; i < 10; ++i) {
      expect(dummy()).toMatch(/\.{10}/);
    }
  });

  test("negated character class", () => {
    const dummy = newDummyGenerator(/[^a-z]/);
    for (let i = 0; i < 10; ++i) {
      expect(dummy()).not.toMatch(/[a-z]/);
    }
  });

  test("complex negated character class combination", () => {
    const dummy = newDummyGenerator(/[^a-zA-F5-7]{2}/);
    for (let i = 0; i < 5; ++i) {
      expect(dummy()).not.toMatch(/^[a-zA-F5-7]{2}$/);
    }
  });

  test("pre-defined character class in range should throw error", () => {
    const patterns = [
      { pattern: /[\b-a]/, errWord: "\\b" },
      { pattern: /[\d-a]/, errWord: "\\d" },
      { pattern: /[a-\w]/, errWord: "\\w" },
      { pattern: /[\s-z]/, errWord: "\\s" },
      { pattern: /[\B-a]/, errWord: "\\B" },
      { pattern: /[\D-a]/, errWord: "\\D" },
      { pattern: /[a-\W]/, errWord: "\\W" },
      { pattern: /[\S-z]/, errWord: "\\S" },
    ];
    patterns.forEach(({ pattern, errWord }) => {
      expect(() => newDummyGenerator(pattern)).toThrow(
        `${errWord} is not supported in character class`
      );
    });
  });

  test("input boundary assertion in character class should throw error", () => {
    expect(() => newDummyGenerator(/[\b]/)).toThrow(
      `Input boundary assertion "\\b" is not supported`
    );
    expect(() => newDummyGenerator(/[\B]/)).toThrow(
      `Input boundary assertion "\\B" is not supported`
    );
  });

  test("empty character class should throw error", () => {
    expect(() => newDummyGenerator(/[]/)).toThrow(
      `Empty character class does not match any characters`
    );
    expect(() => newDummyGenerator(/[^\u0000-\uffff]/)).toThrow(
      `Empty character class does not match any characters`
    );
  });
  test("negate empty character class should not throw error", () => {
    expect(() => newDummyGenerator(/[^]/)).not.toThrow();
  });
});
