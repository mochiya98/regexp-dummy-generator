import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";

describe("newDummyGenerator", () => {
  test("should not handle unicode char when not using u flag", () => {
    const dummy = newDummyGenerator(/🍡{3}/);
    expect(dummy()).toBe("\uD83C\uDF61\uDF61\uDF61");
  });
  test("should handle unicode char when using u flag", () => {
    const dummy = newDummyGenerator(/🍡{3}/u);
    expect(dummy()).toBe("🍡🍡🍡");
  });

  test("should handle d when using u flag", () => {
    const dummy = newDummyGenerator(/\d/u);
    expect(dummy()).toMatch(/^\d$/u);
  });

  test("should handle any length of unicode char", () => {
    expect(newDummyGenerator(/\u{F}/u)()).toMatch(/^\u{F}$/u);
    expect(newDummyGenerator(/\u{FF}/u)()).toMatch(/^\u{FF}$/u);
    expect(newDummyGenerator(/\u{FFF}/u)()).toMatch(/^\u{FFF}$/u);
    expect(newDummyGenerator(/\u{FFFF}/u)()).toMatch(/^\u{FFFF}$/u);
    expect(newDummyGenerator(/\u{FFFFF}/u)()).toMatch(/^\u{FFFFF}$/u);
    expect(newDummyGenerator(/\u{100FFF}/u)()).toMatch(/^\u{100FFF}$/u);
  });

  test("should handle unicode char correctly", () => {
    //@ts-ignore
    expect(newDummyGenerator(/\u{FF}/)()).toMatch(/^\u{FF}$/);
    expect(newDummyGenerator(/\u{FF}/u)()).toMatch(/^\u{FF}$/u);
    //@ts-ignore
    expect(newDummyGenerator(/\u{FF}/)()).toMatch(/^\u{FF}$/);
    //@ts-ignore
    expect(newDummyGenerator(/\u{3}/)()).toMatch(/^\u{3}$/);
  });
});
