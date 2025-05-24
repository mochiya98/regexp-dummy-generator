import { DummyGenContext, NewNodeTextGenerator } from "./types";
import { toRandomCase } from "./toRandomCase";
import { RegExpNodeType } from "../types";

const toBackrefGen = (
  ref: string | number
): ((ctx: DummyGenContext) => string) => {
  if (typeof ref === "number") {
    return (ctx) => ctx._groups[(ref as number) - 1] ?? "";
  } else {
    return (ctx) => ctx._named[ref] ?? "";
  }
};

export const newBackrefTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Backref
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  const backrefGen = toBackrefGen(node._ref);
  return ignoreCase
    ? (ctx) => toRandomCase(backrefGen(ctx), unicode)
    : backrefGen;
};
