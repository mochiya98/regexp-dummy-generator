import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  const cases = [
    {
      title: "normal alternation",
      regExp: /aaa|bbbb|cc/,
      expected: ["aaa", "bbbb", "cc"],
    },
    {
      title: "group alternation",
      regExp: /(aaa)|(bbbb)|cc/,
      expected: ["aaa", "bbbb", "cc"],
    },
    {
      title: "complex mixed",
      regExp: /(aaa|[b])|cc/,
      expected: ["aaa", "b", "cc"],
    },
  ];

  cases.forEach(({ title, regExp, expected }) => {
    test(title, () => {
      const dummy = newDummyGenerator(regExp);
      for (let i = 0; i < 10; ++i) {
        expect(expected).toContain(dummy());
      }
    });
  });
});
