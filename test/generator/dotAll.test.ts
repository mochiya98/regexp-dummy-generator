import { describe, test, expect } from "vitest";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns(
    [
      {
        title: "without dotAll flag",
        regExp: /.{10}/,
        repeat: 10,
      },
    ],
    {
      allLettersRangeClass: "a\r\n\u2028\u2029",
    }
  );
  testGeneratorRegExpPatterns(
    [
      {
        title: "with dotAll flag",
        regExp: /.{10}/s,
        repeat: 10,
      },
    ],
    {
      allLettersRangeClass: "a\r\n\u2028\u2029",
    }
  );
});
