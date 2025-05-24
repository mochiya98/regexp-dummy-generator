import { describe, test, expect } from "vitest";
import { testGeneratorRegExpPatterns } from "./utils";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  test("unsupported RegExp flags", () => {
    expect(() => newDummyGenerator(/a/v)).toThrowError(
      "Unsupported flag(s) in RegExp"
    );
  });
});
