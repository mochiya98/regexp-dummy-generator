import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

const testMinMax = (
  generator: () => string,
  {
    min: optMin,
    max: optMax,
    offset,
  }: { min?: number; max?: number; offset?: number },
  callback: (s: string) => void
) => {
  if (offset) {
    if (optMin !== undefined) optMin += offset;
    if (optMax !== undefined) optMax += offset;
  }
  let min = Infinity,
    max = 0;
  for (let i = 0; i < 200; ++i) {
    const r = generator();
    callback(r);
    if (optMin !== undefined) min = Math.min(min, r.length);
    if (optMax !== undefined) max = Math.max(max, r.length);
    if (
      i > 15 &&
      (optMin === undefined || min === optMin) &&
      (optMax === undefined || max === optMax)
    ) {
      break;
    }
  }
  if (optMin !== undefined) expect(min).toBe(optMin);
  if (optMax !== undefined) expect(max).toBe(optMax);
};

describe("newDummyGenerator", () => {
  test("generates uppercase letters with fixed repetition count", () => {
    const dummy = newDummyGenerator(/[A-Z]{3}/);
    testMinMax(dummy, { min: 3, max: 3 }, (r) => {
      expect(r).toMatch(/^[A-Z]{3}$/);
    });
  });

  test("generates literal sequence followed by repeated character", () => {
    const dummy = newDummyGenerator(/abc{3}/);
    testMinMax(dummy, { offset: 2, min: 3, max: 3 }, (r) => {
      expect(r).toMatch(/^abc{3}$/);
    });
  });

  test("generates repeated character with minimum count", () => {
    const dummy = newDummyGenerator(/a{2,}/);
    testMinMax(dummy, { min: 2 }, (r) => {
      expect(r).toMatch(/^a+$/);
    });
  });

  test("generates repeated character with minimum and maximum count", () => {
    const dummy = newDummyGenerator(/b{3,7}/);
    testMinMax(dummy, { min: 3, max: 7 }, (r) => {
      expect(r).toMatch(/^b+$/);
    });
  });

  test("generates literal sequence followed by zero or more repetitions", () => {
    const dummy = newDummyGenerator(/abc*/);
    testMinMax(dummy, { offset: 2, min: 0 }, (r) => {
      expect(r).toMatch(/^abc*$/);
    });
  });

  test("generates literal sequence followed by one or more repetitions of a character", () => {
    const dummy = newDummyGenerator(/abcD+/);
    testMinMax(dummy, { offset: 3, min: 1 }, (r) => {
      expect(r).toMatch(/^abcD+$/);
      expect(r.length).toBeGreaterThanOrEqual(4);
    });
  });

  test("generates literal sequence followed by an optional character", () => {
    const dummy = newDummyGenerator(/aac?/);
    testMinMax(dummy, { offset: 2, min: 0, max: 1 }, (r) => {
      expect(r).toMatch(/^aac?$/);
    });
  });

  test("generates one or more repetitions with non-greedy quantifier", () => {
    const dummy = newDummyGenerator(/d+?/);
    testMinMax(dummy, { min: 1 }, (r) => {
      expect(r).toMatch(/^d+$/);
    });
  });

  test("generates zero or more repetitions with non-greedy quantifier", () => {
    const dummy = newDummyGenerator(/e*?/);
    testMinMax(dummy, { min: 0 }, (r) => {
      expect(r).toMatch(/^e*$/);
    });
  });

  test("generates optional character with non-greedy quantifier", () => {
    const dummy = newDummyGenerator(/f??/);
    testMinMax(dummy, { min: 0, max: 1 }, (r) => {
      expect(r).toMatch(/^f?$/);
    });
  });

  test("generates repeated character with minimum and maximum count using non-greedy quantifier", () => {
    const dummy = newDummyGenerator(/a{2,4}?/);
    testMinMax(dummy, { min: 2, max: 4 }, (r) => {
      expect(r).toMatch(/^a+$/);
    });
  });

  test("character class repetition", () => {
    const dummy = newDummyGenerator(/[a-c]{5}/);
    testMinMax(dummy, { min: 5, max: 5 }, (r) => {
      expect(r).toMatch(/^[a-c]{5}$/);
    });
  });

  test("negated character class repetition", () => {
    const dummy = newDummyGenerator(/[^a-c]{3}/);
    testMinMax(dummy, { min: 3, max: 3 }, (r) => {
      expect(r).not.toMatch(/^[a-c]{3}$/);
    });
  });

  testGeneratorRegExpPatterns([
    {
      title: "repetition of group",
      regExp: /(abcd){3}/,
    },
    {
      title: 'should handle "{" that is not a quantifier',
      regExp: /{12,ab/,
    },
    {
      title: "repetition of \\x58",
      regExp: /AB\x58{3}CD/,
    },
    {
      title: "repetition of \\35",
      // @ts-ignore
      regExp: /AB\35{3}CD/,
    },
    {
      title: "repetition of \\39",
      // @ts-ignore
      regExp: /AB\39{3}CD/,
    },
    {
      title: "repetition of \\0",
      regExp: /AB\0{3}CD/,
    },
    {
      title: "repetition of \\05",
      // @ts-ignore
      regExp: /AB\05{3}CD/,
    },
    {
      title: "repetition of \\400 (over octal limit)",
      // @ts-ignore
      regExp: /AB\400{3}CD/,
    },
    {
      title: "repetition of \\01 (start of zero should parse as \\0)",
      // @ts-ignore
      regExp: /AB\01{3}CD/,
    },
  ]);

  testGeneratorRegExpPatterns([
    {
      title: "empty capture group repeat min=0",
      regExp: /A(B|){0,}_\1/,
      repeat: 24,
    },
    {
      title: "empty capture group repeat min=1",
      regExp: /A(B|){1,}_\1/,
      repeat: 24,
    },
    {
      title: "empty capture group repeat min=2",
      regExp: /A(B|){2,}_\1/,
      repeat: 24,
    },
    {
      title: "empty capture group repeat min=3",
      regExp: /A(B|){3,}_\1/,
      repeat: 24,
    },
    {
      title: "empty nested capture group repeat min=3",
      regExp: /A(?:(B|)){3,}_\1/,
      repeat: 24,
    },
  ]);
});
