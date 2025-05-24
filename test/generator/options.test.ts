import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  test("allLettersRangeClass", () => {
    const dummy = newDummyGenerator(/.{10}/, {
      allLettersRangeClass: "A-C",
    });
    for (let i = 0; i < 10; ++i) {
      expect(dummy()).toMatch(/^[A-C]{10}$/);
    }
  });
  test("defaultMaxRepeat", () => {
    for (const regexp of [/a+/, /a*/, /a{1,}/]) {
      for (const n of [1, 3, 7]) {
        const dummy = newDummyGenerator(regexp, {
          defaultMaxRepeat: n,
        });
        for (let i = 0; i < 64; ++i) {
          expect(dummy().length).toBeLessThanOrEqual(n);
        }
      }
    }
  });
});
