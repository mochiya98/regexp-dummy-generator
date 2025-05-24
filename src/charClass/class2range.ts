import { CharClassItem, CharClassRange, CharClassType } from "../types";

export const class2range = (items: CharClassItem[]): CharClassRange[] =>
  items.map<CharClassRange>((c) =>
    c._type === CharClassType.Range
      ? c
      : {
          _type: CharClassType.Range,
          _start: c._cp,
          _end: c._cp,
        }
  );
