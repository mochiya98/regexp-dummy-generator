import { describe } from "vitest";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns(
    [
      { title: "unicode: Binary_Properties", regExp: /\p{AHex}/u, repeat: 5 },
      {
        title: "unicode: General_Category longName shortValue",
        regExp: /\p{General_Category=Cc}/u,
        repeat: 5,
      },
      {
        title: "unicode: General_Category longName longValue",
        regExp: /\p{General_Category=Control}/u,
        repeat: 5,
      },
      {
        title: "unicode: General_Category shortName shortValue",
        regExp: /\p{gc=Cc}/u,
        repeat: 5,
      },
      {
        title: "unicode: General_Category withoutName shortValue",
        regExp: /\p{Cc}/u,
        repeat: 5,
      },
      {
        title: "unicode: Script longName shortValue",
        regExp: /\p{Script=Hira}/u,
        repeat: 5,
      },
      {
        title: "unicode: Script longName longValue",
        regExp: /\p{Script=Hiragana}/u,
        repeat: 5,
      },
      {
        title: "unicode: Script_Extensions longName shortValue",
        regExp: /\p{Script_Extensions=Hira}/u,
        repeat: 5,
      },
      {
        title: "unicode: Script_Extensions longName longValue",
        regExp: /\p{Script_Extensions=Hiragana}/u,
        repeat: 5,
      },
      {
        title: "negate",
        regExp: /\P{Script=Hiragana}/u,
        repeat: 5,
      },
      {
        title: "non-unicode mode",
        //@ts-ignore
        regExp: /\p{Script=Hiragana}/,
        repeat: 5,
      },
      {
        title: "non-unicode mode negate",
        //@ts-ignore
        regExp: /\P{Script=Hiragana}/,
        repeat: 5,
      },
    ],
    {
      allLettersRangeClass: "\x00-\uFFFF",
    }
  );
});
