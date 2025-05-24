import { expect, test, describe } from "vitest";
import { __charClassInternal } from "@/charClass";
import { CharClassType } from "@/types";

describe("newPickCharFromCharClass", () => {
  test("index out of range", () => {
    expect(
      __charClassInternal.newPickCharFromCharClass(
        [{ _type: CharClassType.Range, _start: 1, _end: 2 }],
        9999999
      )()
    ).toBe("");
  });
});
