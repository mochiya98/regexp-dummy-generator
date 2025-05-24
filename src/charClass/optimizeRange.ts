import { CharClassItem, CharClassRange, CharClassType } from "../types";
import { class2range } from "./class2range";

export const optimizeCharClassRange = (
  items: CharClassItem[]
): CharClassItem[] => {
  const rangeItems = class2range(items).sort((a, b) => a._start - b._start);

  const optimizedRangeItems: CharClassRange[] = [];
  let prev: CharClassRange | null = null;
  for (const item of rangeItems) {
    if (prev && prev._end + 1 >= item._start) {
      prev._end = Math.max(prev._end, item._end);
    } else {
      prev = { ...item };
      optimizedRangeItems.push(prev);
    }
  }
  return optimizedRangeItems.map((c) =>
    c._start === c._end ? { _type: CharClassType.Char, _cp: c._start } : c
  );
};
