import { describe, test, expect } from "vitest";
import { testGeneratorRegExpPatterns } from "./utils";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  test("wildcard", () => {
    expect(newDummyGenerator(/.{5}/)).not.toBe(".....");
  });
  testGeneratorRegExpPatterns([
    {
      title: "control character",
      regExp: /\cC/,
    },
    {
      title: "hexadecimal character",
      regExp: /\xFF/,
    },
    {
      title: "escaped dot",
      regExp: /\./,
    },
    {
      title: "escaped hexadecimal character",
      //@ts-ignore
      regExp: /\xD\8/,
    },
    {
      title: "null character",
      regExp: /\0/,
    },
    {
      title: "backslash",
      regExp: /\\/,
    },
    {
      title: "unsupported escape should ignored",
      regExp: /\q/,
    },
    {
      title: "escaped parentheses",
      regExp: /\\(escaped_parentheses\\)/,
    },
  ]);
});
