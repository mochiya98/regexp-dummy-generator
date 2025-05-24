import { RegExpNodeType } from "../types";
import { genCharFromCharClass } from "../charClass";
import { NewNodeTextGenerator } from "./types";

export const newCharClassTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.CharClass
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  const fn = genCharFromCharClass(
    node._cls,
    ignoreCase,
    unicode,
    dotAll,
    node._wildcard,
    node._negate,
    options.allLettersRangeClass
  );
  return fn;
};
