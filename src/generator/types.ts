import { RegExpNode } from "../types";

export type DummyGenContext = {
  _groups: string[];
  _named: Record<string, string>;
};

/**
 * Options for dummy string generation.
 * @property allLettersRangeClass If specified, overrides the character class used for dot (.) and similar patterns. Should be a string like "A-Z" or "a-zA-Z0-9".
 * @property defaultMaxRepeat The maximum number used for unbounded repeat patterns (e.g., x+, x*, x{n,}). If not specified, defaults to 10.
 */
export type RegExpDummyGeneratorOptions = {
  allLettersRangeClass?: string;
  defaultMaxRepeat?: number;
};

export type NewNodeTextGenerator<T extends RegExpNode["_type"]> = (
  node: RegExpNode & { _type: T },
  ignoreCase: boolean,
  unicode: boolean,
  dotAll: boolean,
  options: RegExpDummyGeneratorOptions,
  recurse: NewNodeTextGenerator<RegExpNode["_type"]>
) => (ctx: DummyGenContext) => string;
