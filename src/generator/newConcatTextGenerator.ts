import { RegExpNodeType } from "../types";
import { NewNodeTextGenerator } from "./types";

export const newConcatTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Concat
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  const fns = node._children.map((c) =>
    recurse(c, ignoreCase, unicode, dotAll, options, recurse)
  );
  return (ctx) => {
    let s = "";
    for (let i = 0; i < fns.length; i++) {
      s += fns[i](ctx);
    }
    return s;
  };
};
