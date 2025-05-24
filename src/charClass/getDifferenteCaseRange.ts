import {
  completeCaseFoldingArr,
  completeCaseFoldingMap,
  completeUnicodeCaseFoldingArr,
  completeUnicodeCaseFoldingMap,
} from "../unicode/getDifferentCase";
import {
  CharClassChar,
  CharClassItem,
  CharClassRange,
  CharClassType,
} from "../types";

export const getDifferenteCaseRange = (
  items: CharClassItem[],
  unicode: boolean,
  negate: boolean
) => {
  let differentCases: Set<CharClassChar> = new Set();
  const targetCompleteCaseFoldingMap = unicode
    ? completeUnicodeCaseFoldingMap
    : completeCaseFoldingMap;
  const targetCompleteCaseFoldingArr = unicode
    ? completeUnicodeCaseFoldingArr
    : completeCaseFoldingArr;

  const addExtraChars = (range: CharClassRange) => {
    let begin: number | null = null;
    for (let i = 0; i < targetCompleteCaseFoldingArr.length; i++) {
      if (targetCompleteCaseFoldingArr[i][0] >= range._start) {
        begin = i;
        break;
      }
    }
    if (begin === null) return;
    let end: number = targetCompleteCaseFoldingArr.length - 1;
    for (let i = begin; i < targetCompleteCaseFoldingArr.length; i++) {
      if (targetCompleteCaseFoldingArr[i][0] > range._end) {
        end = i - 1;
        break;
      }
    }
    for (const c of targetCompleteCaseFoldingArr
      .slice(begin, end + 1)
      .map((c) => c[1])
      .flat(1))
      differentCases.add(c);
  };
  const addExtraChar = (cp: number) => {
    const extraChars: CharClassChar[] | undefined =
      targetCompleteCaseFoldingMap.get(cp);
    if (extraChars) {
      for (const c of extraChars) {
        differentCases.add(c);
      }
    }
  };
  for (const item of items) {
    if (item._type === CharClassType.Char) {
      addExtraChar(item._cp);
    } else {
      addExtraChars(item);
    }
  }
  return [...differentCases];
};
