import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  test("/should throw error input boundary assertion/i", () => {
    expect(() => newDummyGenerator(/a(a^t)es(t|$)cc/)).toThrow(
      'Input boundary assertion "^" is not supported'
    );
    expect(() => newDummyGenerator(/^test$/)).toThrow(
      'Input boundary assertion "^" is not supported'
    );
    expect(() => newDummyGenerator(/\btest/)).toThrow(
      'Input boundary assertion "\\b" is not supported'
    );
    expect(() => newDummyGenerator(/\Btest/)).toThrow(
      'Input boundary assertion "\\B" is not supported'
    );
  });
  test("/should throw error zero-width assertion/i", () => {
    expect(() => newDummyGenerator(/(abc(?=hoge))/)).toThrow(
      "lookahead assertion is not supported"
    );
    expect(() => newDummyGenerator(/(abc(?!hoge))/)).toThrow(
      "negativeLookahead assertion is not supported"
    );
    expect(() => newDummyGenerator(/(ab)|(?<=abc)hoge/)).toThrow(
      "lookbehind assertion is not supported"
    );
    expect(() => newDummyGenerator(/(ab)|(?<!abc)hoge/)).toThrow(
      "negativeLookbehind assertion is not supported"
    );
  });
});
