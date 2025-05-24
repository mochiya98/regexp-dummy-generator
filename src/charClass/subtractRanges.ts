import { CharClassItem, CharClassRange, CharClassType } from "../types";
import { class2range } from "./class2range";

type SLEvent = {
  _pos: number;
  _delta: number;
  _isExclude: boolean;
};

const prepareEvents = (
  events: SLEvent[],
  items: CharClassItem[],
  _isExclude: boolean
) => {
  for (const r of class2range(items)) {
    events.push({ _pos: r._start, _delta: 1, _isExclude });
    events.push({ _pos: r._end + 1, _delta: -1, _isExclude });
  }
};

export const subtractRanges = (
  base: CharClassItem[],
  excludes: CharClassItem[]
): CharClassItem[] => {
  const events: SLEvent[] = [];

  prepareEvents(events, base, false);
  prepareEvents(events, excludes, true);

  events.sort((a, b) => a._pos - b._pos || (a._isExclude ? -1 : 1));

  // sweep line
  let baseCount = 0;
  let excludeCount = 0;
  let lastPos: number | null = null;
  const result: CharClassItem[] = [];

  for (const e of events) {
    if (lastPos !== null && lastPos < e._pos) {
      if (baseCount > 0 && excludeCount === 0) {
        const len = e._pos - lastPos;
        if (len === 1) {
          result.push({ _type: CharClassType.Char, _cp: lastPos });
        } else if (len > 1) {
          result.push({
            _type: CharClassType.Range,
            _start: lastPos,
            _end: e._pos - 1,
          });
        }
      }
    }
    if (e._isExclude) {
      excludeCount += e._delta;
    } else {
      baseCount += e._delta;
    }
    lastPos = e._pos;
  }
  return result;
};
