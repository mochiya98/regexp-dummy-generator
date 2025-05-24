import { CharClassItem, CharClassType } from "../types";
import { surrogateRange } from "./definedRanges";
import { parseCharClass } from "./parseCharClass";
import { subtractRanges } from "./subtractRanges";

const countCharClassItems = (items: CharClassItem[]): number => {
  let count = 0;
  for (const item of items) {
    count +=
      item._type === CharClassType.Range ? item._end - item._start + 1 : 1;
  }
  return count;
};

const throwEmptyCharClassError = () => {
  throw new Error("Empty character class does not match any characters");
};

const newPickCharFromCharClass = (
  items: CharClassItem[],
  computedTotal?: number
): (() => string) => {
  const total = computedTotal ?? countCharClassItems(items);
  if (total === 0) {
    throwEmptyCharClassError();
  }
  const optimizedItems = items.map((item) => {
    if (item._type === CharClassType.Range) {
      return item;
    }
    return {
      _type: CharClassType.Char,
      _char: String.fromCodePoint(item._cp),
    } as {
      _type: CharClassType.Char;
      _char: string;
    };
  });
  return () => {
    let idx = Math.floor(Math.random() * total);
    for (const item of optimizedItems) {
      if (item._type === CharClassType.Range) {
        const rangeLen = item._end - item._start + 1;
        if (idx < rangeLen) {
          return String.fromCodePoint(item._start + idx);
        }
        idx -= rangeLen;
      } else {
        if (idx === 0) return item._char;
        idx -= 1;
      }
    }
    return "";
  };
};

export const genCharFromCharClass = (
  cls: string,
  ignoreCase: boolean,
  unicode: boolean,
  dotAll: boolean,
  useWildcard: boolean,
  negate: boolean = false,
  allLettersRangeClass: string | null = null
) => {
  const allLettersRange: CharClassItem[] = allLettersRangeClass
    ? parseCharClass(allLettersRangeClass, false, unicode, false, false, false)
    : [
        {
          _type: CharClassType.Range,
          _start: 0x0000,
          _end: unicode ? 0x10ffff : 0xffff,
        },
      ];

  if (cls.length === 0) {
    if (negate) return newPickCharFromCharClass(allLettersRange);
    throwEmptyCharClassError();
  }
  let ranges = parseCharClass(
    cls,
    ignoreCase,
    unicode,
    dotAll,
    useWildcard,
    negate,
    allLettersRange
  );
  if (negate) {
    ranges = subtractRanges(allLettersRange, ranges);
  }
  if (unicode) {
    ranges = subtractRanges(ranges, surrogateRange);
  }
  return newPickCharFromCharClass(ranges);
};

export const __charClassInternal = {
  newPickCharFromCharClass,
};
