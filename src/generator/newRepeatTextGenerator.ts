import { RegExpNodeType } from "../types";
import { DummyGenContext, NewNodeTextGenerator } from "./types";

const cloneCtx = (ctx: DummyGenContext): DummyGenContext => {
  return {
    _groups: ctx._groups.slice(),
    _named: { ...ctx._named },
  };
};

export const newRepeatTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Repeat
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  let fn: (ctx: DummyGenContext) => string = recurse(
    node._child,
    ignoreCase,
    unicode,
    dotAll,
    options,
    recurse
  );
  const maxRepeat =
    node._max === Infinity ? options.defaultMaxRepeat ?? 10 : node._max;

  return (ctx: DummyGenContext) => {
    let n = node._min;
    if (maxRepeat > node._min) {
      n += Math.floor(Math.random() * (maxRepeat - n + 1));
    }
    let s = "";
    let lastLocalCtx: DummyGenContext | null = null;
    for (let i = 0; i < n; i++) {
      const localCtx = cloneCtx(ctx);
      const c = fn(localCtx);
      if (c.length === 0 && i >= node._min) {
        continue;
      }
      s += c;
      lastLocalCtx = localCtx;
    }
    if (lastLocalCtx) {
      ctx._groups = lastLocalCtx._groups;
      ctx._named = lastLocalCtx._named;
    }
    return s;
  };
};
