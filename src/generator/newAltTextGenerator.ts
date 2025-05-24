import { RegExpNodeType } from "../types";
import { NewNodeTextGenerator } from "./types";

export const newAltTextGenerator: NewNodeTextGenerator<RegExpNodeType.Alt> = (
  node,
  ignoreCase,
  unicode,
  dotAll,
  options,
  recurse
) => {
  const altFns = node._alts.map((alt) =>
    recurse(
      alt.length === 1
        ? alt[0]
        : { _type: RegExpNodeType.Concat, _children: alt },
      ignoreCase,
      unicode,
      dotAll,
      options,
      recurse
    )
  );
  return (ctx) => {
    const idx = Math.floor(Math.random() * altFns.length);
    return altFns[idx](ctx);
  };
};
