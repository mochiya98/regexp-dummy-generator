import { charTokenToCodePoint, strToCharTokens } from "../charToken";
import { NewNodeTextGenerator } from "./types";
import { toRandomCase } from "./toRandomCase";
import { RegExpNodeType } from "../types";

export const newLiteralTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Literal
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  const parsed = strToCharTokens(node._value, unicode)
    .map((t) => String.fromCodePoint(charTokenToCodePoint(t)))
    .join("");
  return ignoreCase ? () => toRandomCase(parsed, unicode) : () => parsed;
};
