import { parseRegExp } from "../ast";
import { RegExpNode, RegExpNodeType } from "../types";
import {
  DummyGenContext,
  NewNodeTextGenerator,
  RegExpDummyGeneratorOptions,
} from "./types";
import { newCharClassTextGenerator } from "./newCharClassTextGenerator";
import { newGroupTextGenerator } from "./newGroupTextGenerator";
import { newRepeatTextGenerator } from "./newRepeatTextGenerator";
import { newAltTextGenerator } from "./newAltTextGenerator";
import { newAssertionTextGenerator } from "./newAssertionTextGenerator";
import { newBackrefTextGenerator } from "./newBackrefTextGenerator";
import { newConcatTextGenerator } from "./newConcatTextGenerator";
import { newLiteralTextGenerator } from "./newLiteralTextGenerator";

const nodeTextGenerators: {
  [K in RegExpNode["_type"]]: NewNodeTextGenerator<K>;
} = {
  [RegExpNodeType.Literal]: newLiteralTextGenerator,
  [RegExpNodeType.CharClass]: newCharClassTextGenerator,
  [RegExpNodeType.Group]: newGroupTextGenerator,
  [RegExpNodeType.Backref]: newBackrefTextGenerator,
  [RegExpNodeType.Repeat]: newRepeatTextGenerator,
  [RegExpNodeType.Alt]: newAltTextGenerator,
  [RegExpNodeType.Concat]: newConcatTextGenerator,
  [RegExpNodeType.Assertion]: newAssertionTextGenerator,
};

export const newNodeTextGenerator: NewNodeTextGenerator<RegExpNode["_type"]> = (
  node,
  ignoreCase,
  unicode,
  dotAll,
  options,
  recurse
) => {
  return (
    nodeTextGenerators[node._type] as NewNodeTextGenerator<RegExpNode["_type"]>
  )(node, ignoreCase, unicode, dotAll, options, recurse);
};

/**
 * Creates a dummy string generator function based on the given regular expression.
 * @param {RegExp} regexp The regular expression to generate dummy strings for.
 * @param {RegExpDummyGeneratorOptions} options Optional settings for generation behavior.
 * @param {string} options.allLettersRangeClass If specified, overrides the character class used for dot (.) and similar patterns. Should be a string like "A-Z" or "a-zA-Z0-9".
 * @param {number} options.defaultMaxRepeat The maximum number used for unbounded repeat patterns (e.g., x+, x*, x{n,}). If not specified, defaults to 10.
 * @returns {() => string} A function that generates a string matching the given regular expression.
 */
export const newDummyGenerator = (
  regexp: RegExp,
  options: RegExpDummyGeneratorOptions = {}
) => {
  if (regexp.flags.match(/[^dgimsuy]/)) {
    throw new Error(`Unsupported flag(s) in RegExp`);
  }
  const ast = parseRegExp(regexp.source, regexp.unicode);
  const gen = newNodeTextGenerator(
    ast,
    regexp.ignoreCase,
    regexp.unicode,
    regexp.dotAll,
    options,
    newNodeTextGenerator
  );
  return () => {
    const ctx: DummyGenContext = { _groups: [], _named: {} };
    let generated = gen(ctx);
    return generated;
  };
};
