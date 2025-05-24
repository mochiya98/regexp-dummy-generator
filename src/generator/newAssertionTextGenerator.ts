import { RegExpNodeType } from "../types";
import { NewNodeTextGenerator } from "./types";

export const newAssertionTextGenerator: NewNodeTextGenerator<
  RegExpNodeType.Assertion
> = (node, ignoreCase, unicode, dotAll, options, recurse) => {
  throw new Error(
    `Input boundary assertion "${node._symbol}" is not supported`
  );
};
