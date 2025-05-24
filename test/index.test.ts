import { newDummyGenerator } from "@/index";
import { describe, expect, test } from "vitest";

describe("index.ts", () => {
  test("newDummyGenerator exported", () => {
    expect(newDummyGenerator).not.toBeUndefined();
  });
});
