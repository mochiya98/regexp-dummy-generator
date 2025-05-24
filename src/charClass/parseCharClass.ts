import { charTokenToCodePoint, strToCharTokens } from "../charToken";
import { CharClassItem, CharClassRange, CharClassType } from "../types";
import { getUnicodeRange } from "../unicode/getUnicodeRange";
import {
  digitRange,
  nonDotRange,
  whitespaceRange,
  wordRange,
} from "./definedRanges";
import { getDifferenteCaseRange } from "./getDifferenteCaseRange";
import { optimizeCharClassRange } from "./optimizeRange";
import { subtractRanges } from "./subtractRanges";

const throwIBAError = (t: string) => {
  throw new Error(
    `Input boundary assertion "\\${t}" is not supported in character class`
  );
};

export const parseCharClass = (
  cls: string,
  ignoreCase: boolean,
  unicode: boolean,
  dotAll: boolean,
  useWildcard: boolean,
  negate: boolean,
  allLettersRange: CharClassItem[] = [
    { _type: CharClassType.Range, _start: 0x20, _end: 0x7e },
  ]
): CharClassItem[] => {
  const cTokens = strToCharTokens(cls, unicode);
  let clsItems: CharClassItem[] = [];
  const simpleEscapedTokenHandlers: { [key: string]: (token: string) => void } =
    {
      d: () => clsItems.push(...digitRange),
      w: () => clsItems.push(...wordRange),
      s: () => clsItems.push(...whitespaceRange),
      D: () => clsItems.push(...subtractRanges(allLettersRange, digitRange)),
      W: () => clsItems.push(...subtractRanges(allLettersRange, wordRange)),
      S: () =>
        clsItems.push(...subtractRanges(allLettersRange, whitespaceRange)),
      b: () => throwIBAError("b"),
      B: () => throwIBAError("B"),
    };

  for (let i = 0; i < cTokens.length; i++) {
    if (cTokens[i] === "." && useWildcard) {
      clsItems.push(
        ...(dotAll
          ? allLettersRange
          : subtractRanges(allLettersRange, nonDotRange))
      );
      continue;
    }
    if (i + 2 < cTokens.length && cTokens[i + 1] === "-") {
      for (const n of [i, i + 2]) {
        if (/^\\[bdwsBDWS]$/.test(cTokens[n])) {
          throw new Error(`${cTokens[n]} is not supported in character class`);
        }
      }
      clsItems.push({
        _type: CharClassType.Range,
        _start: charTokenToCodePoint(cTokens[i]),
        _end: charTokenToCodePoint(cTokens[i + 2]),
      });
      i += 2;
      continue;
    }
    if (cTokens[i][0] !== "\\") {
      clsItems.push({
        _type: CharClassType.Char,
        _cp: cTokens[i].codePointAt(0)!,
      });
      continue;
    }
    const simpleEscapedTokenHandler: ((token: string) => void) | undefined =
      simpleEscapedTokenHandlers[cTokens[i][1]];
    if (simpleEscapedTokenHandler) {
      simpleEscapedTokenHandler(cTokens[i]);
      continue;
    }
    const upeMatch = cTokens[i].match(
      /^\\([Pp])\{(?:([A-Za-z0-9_]+)=|)([A-Za-z0-9_]+)\}$/
    );
    if (upeMatch) {
      const [, type, name, value] = upeMatch;
      const isNeg = type === "P";
      let range = getUnicodeRange(name, value);
      if (!range) {
        throw new Error(
          `Unicode property escapes ${cTokens[i]} is not supported`
        );
      }
      if (isNeg) {
        range = subtractRanges(allLettersRange, range);
      }
      clsItems.push(...range);
      continue;
    }
    clsItems.push({
      _type: CharClassType.Char,
      _cp: charTokenToCodePoint(cTokens[i]),
    });
  }

  if (ignoreCase) {
    clsItems.push(...getDifferenteCaseRange(clsItems, unicode, negate));
  }

  return optimizeCharClassRange(clsItems);
};
