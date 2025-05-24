import { describe, test, expect } from "vitest";
import { newDummyGenerator } from "@/generator";
import { testGeneratorRegExpPatterns } from "./utils";

describe("newDummyGenerator", () => {
  testGeneratorRegExpPatterns([
    {
      title: "should handle backreference to a single capturing group",
      regExp: /(ab)\1/,
    },
    {
      title: "should handle backreference before capturing group",
      //@ts-ignore
      regExp: /(ab)\1\2\3(cd)/,
    },
    {
      title:
        "should handle multiple capturing groups with backreferences in sequence",
      regExp: /(xyz)(abc)\2\1/,
    },
    {
      title: "should handle nested capturing groups with backreferences",
      regExp: /((aa)(bb))\2\3/,
    },
    {
      title:
        "should handle capturing groups with backreferences inside another group",
      regExp: /(aa)(A\1A)\2/,
    },
    {
      title: "should handle one or more repetitions of a non-capturing group",
      regExp: /(?:ab)+/,
    },
    {
      title:
        "should handle nested non-capturing groups with one or more repetitions",
      regExp: /(?:x(?:y(?:z)))+/,
    },
    {
      title: "should handle group with single concat child",
      regExp: /(abc)/,
    },
    {
      title: "should handle group with multiple children",
      regExp: /(ab[a])/,
    },
    {
      title:
        "should handle one or more repetitions of a sequence with nested repeated group",
      regExp: /(?:a(?:bc){2})+/,
    },
    {
      title: "optional group backreference",
      regExp: /((aa)|bb)\2/,
      repeat: 5,
    },
    {
      title: "should handle group with single alt child",
      regExp: /(a|b)/,
      repeat: 5,
    },
    {
      title:
        "should handle capturing group inside non-capturing group correctly",
      regExp: /(?:([a-zA-Z]))+\1/,
      repeat: 10,
    },
    {
      title:
        "should handle self-referential group with backreference correctly",
      regExp: /(ab\1cd){2}ef\1/,
      repeat: 10,
    },
    {
      title: "out of range backreference as octal escape (\\1)",
      //@ts-ignore
      regExp: /\1/,
    },
    {
      title: "out of range backreference as octal escape (\\7)",
      //@ts-ignore
      regExp: /\7/,
    },
    {
      title: "out of range backreference as literal (\\8)",
      //@ts-ignore
      regExp: /\8/,
    },
    {
      title: "out of range backreference as octal escape (\\125)",
      //@ts-ignore
      regExp: /\125/,
    },
    {
      title:
        "out of range backreference as octal escape (\\1) and literal (92)",
      //@ts-ignore
      regExp: /\192/,
    },
    {
      title:
        "out of range backreference as octal escape (\\111) and literal (1)",
      //@ts-ignore
      regExp: /\1111/,
    },
    {
      title: "multiple-digit backreference index should handle correctly",
      //@ts-ignore
      regExp: /(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)(11)(12)\12\13/,
    },
  ]);
});
