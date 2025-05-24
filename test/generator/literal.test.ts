import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns([
    {
      title: "should generate the exact literal string for a simple pattern",
      regExp: /abc/,
    },
    {
      title: "hyphen outside of charClass",
      regExp: /a-z/,
    },
  ]);
});
