import { CharClassChar, CharClassType } from "../types";
import {
  extraCaseFolding,
  extraUnicodeCaseFolding,
  noRepeatCaseFolding,
  repeatCaseFolding,
} from "./generatedTable";

const readChunks = <T>(arr: T[], n: number, cb: (chunk: T[]) => void) => {
  for (let i = 0; i < arr.length; i += n) {
    const chunk = arr.slice(i, i + n);
    cb(chunk);
  }
};

const baseCaseFoldingMap = new Map<number, number>();
const addCaseFoldingEntry = (
  nFrom: number,
  nDiff: number,
  nRepeat: number,
  nJump: number
) => {
  for (let i = nRepeat; i--; nFrom += nJump) {
    baseCaseFoldingMap.set(nFrom, nFrom + nDiff);
    baseCaseFoldingMap.set(nFrom + nDiff, nFrom);
  }
};
readChunks(noRepeatCaseFolding, 2, ([nFrom, nDiff]) => {
  addCaseFoldingEntry(nFrom, nDiff, 1, 0);
});
let nBefFrom = 0;
readChunks(repeatCaseFolding, 4, ([nRelFrom, nDiff, nRepeat, nJump]) => {
  const nFrom = nRelFrom + nBefFrom;
  nBefFrom = nFrom;
  addCaseFoldingEntry(nFrom, nDiff, nRepeat, nJump);
});

const addMapEntry = (
  map: Map<number, CharClassChar[]>,
  nFrom: number,
  nTo: number
) => {
  const codes = map.get(nFrom) ??
    map.get(nTo) ?? [
      { _type: CharClassType.Char, _cp: nFrom },
      { _type: CharClassType.Char, _cp: nTo },
    ];
  const addIfNotExists = (cp: number) => {
    if (!codes.some((c) => c._cp === cp))
      codes.push({ _type: CharClassType.Char, _cp: cp });
    map.set(cp, codes);
  };
  addIfNotExists(nTo);
  addIfNotExists(nFrom);
};

const toExtraCaseFoldingMap = (
  extraCaseFolding: number[],
  baseMap: Map<number, CharClassChar[]> = new Map()
) => {
  const map = structuredClone(baseMap);
  let nBefFrom = 0;
  readChunks(extraCaseFolding, 2, ([nRelFrom, nDiff]) => {
    const nFrom = nRelFrom + nBefFrom;
    const nTo = nFrom + nDiff;
    addMapEntry(map, nFrom, nTo);
    nBefFrom = nFrom;
  });
  return map;
};
const toExtraCaseFoldingArr = (
  map: Map<number, CharClassChar[]>
): [number, CharClassChar[]][] =>
  [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([codePoint, codes]) => [codePoint, codes]);

const toCompleteCaseFoldingMap = (
  baseMap: Map<number, CharClassChar[]> = new Map(),
  unicode: boolean
) => {
  const map = structuredClone(baseMap);
  for (const [codePoint, differentCase] of baseCaseFoldingMap.entries()) {
    if (!unicode && codePoint > 0xffff) continue;
    addMapEntry(map, codePoint, differentCase);
  }
  return map;
};

const extraCaseFoldingMap = toExtraCaseFoldingMap(extraCaseFolding);
const extraUnicodeCaseFoldingMap = toExtraCaseFoldingMap(
  extraUnicodeCaseFolding,
  extraCaseFoldingMap
);

export const completeCaseFoldingMap = toCompleteCaseFoldingMap(
  extraCaseFoldingMap,
  false
);
export const completeUnicodeCaseFoldingMap = toCompleteCaseFoldingMap(
  extraUnicodeCaseFoldingMap,
  true
);

export const completeCaseFoldingArr = toExtraCaseFoldingArr(
  completeCaseFoldingMap
);
export const completeUnicodeCaseFoldingArr = toExtraCaseFoldingArr(
  completeUnicodeCaseFoldingMap
);

const toCodePointsMap = (map: Map<number, CharClassChar[]>) => {
  return new Map(
    [...map.entries()].map(([codePoint, chars]) => [
      codePoint,
      chars.map((c) => c._cp),
    ])
  );
};

const extraCaseFoldingCpsMap = toCodePointsMap(extraCaseFoldingMap);
const extraUnicodeCaseFoldingCpsMap = toCodePointsMap(
  extraUnicodeCaseFoldingMap
);

export const getRandomCaseCp = (
  codePoint: number,
  unicode: boolean
): number => {
  const targetExtraCaseFoldingMap = unicode
    ? extraUnicodeCaseFoldingCpsMap
    : extraCaseFoldingCpsMap;
  let extraCps = targetExtraCaseFoldingMap.get(codePoint);
  const differentCaseCp = baseCaseFoldingMap.get(codePoint);
  const diffExtraCps =
    differentCaseCp && targetExtraCaseFoldingMap.get(differentCaseCp);
  if (!extraCps && !diffExtraCps) {
    if (differentCaseCp && Math.random() < 0.5) {
      return differentCaseCp;
    }
    return codePoint;
  }
  const cps = (extraCps ?? [codePoint]).concat(
    diffExtraCps ?? (differentCaseCp ? [differentCaseCp] : [])
  );
  return cps[Math.floor(Math.random() * cps.length)];
};
