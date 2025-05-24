import { describe, test, expect } from "vitest";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns([
    {
      title: "named group and k<Name> backreference",
      regExp: /(?<foo>\d{2})\k<foo>/,
      repeat: 10,
    },
    {
      title: "multiple named groups and k<Name> backreference",
      regExp: /(?<a>\d)(?<b>[A-Z])\k<b>\k<a>/,
      repeat: 10,
    },
    {
      title: "nested named groups and references",
      regExp: /(?<x>(?<y>\d{2})[A-Z])\k<y>\k<x>/,
      repeat: 10,
    },
    {
      title: "optional named group backreference",
      regExp: /(?<foo>(?<bar>aa)|bb)\k<bar>/,
      repeat: 10,
    },
    {
      title: "skip escape when not defined named group",
      //@ts-ignore
      regExp: /\k<ab[A-F]>/,
      repeat: 10,
    },
  ]);
});
