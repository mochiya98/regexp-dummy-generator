import { RegExpNodeType } from "../types";
import { DummyGenContext, NewNodeTextGenerator } from "./types";

export const newGroupTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Group
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  if (node._assertion !== null) {
    throw new Error(`${node._assertion} assertion is not supported`);
  }
  let subIgnoreCase = ignoreCase;
  let subDotAll = dotAll;
  if (node._addFlags?.s) subDotAll = true;
  if (node._subFlags?.s) subDotAll = false;
  if (node._addFlags?.i) subIgnoreCase = true;
  if (node._subFlags?.i) subIgnoreCase = false;
  let childFn: (ctx: DummyGenContext) => string;
  if (
    node._children.length === 1 &&
    (node._children[0]._type === RegExpNodeType.Alt ||
      node._children[0]._type === RegExpNodeType.Concat)
  ) {
    childFn = recurse(
      node._children[0],
      subIgnoreCase,
      unicode,
      subDotAll,
      options,
      recurse
    );
  } else {
    childFn = recurse(
      { _type: RegExpNodeType.Concat, _children: node._children },
      subIgnoreCase,
      unicode,
      subDotAll,
      options,
      recurse
    );
  }
  return (ctx) => {
    let s = childFn(ctx);
    if (node._capturing) {
      ctx._groups[node._groupIndex!] = s;
      if (node._name) {
        ctx._named[node._name] = s;
      }
    }
    return s;
  };
};
