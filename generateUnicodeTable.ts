import fs from "node:fs";
import unicodeCategories from "@unicode/unicode-16.0.0";
import { encodeBERBinary } from "@/unicode/ber";
import { encodeExb64 } from "@/unicode/exb64";
import { encodeCodePoints } from "@/unicode/rangeUtils";

const unicodeBaseUrl = "https://www.unicode.org/Public/16.0.0/ucd/";

type ShortUnicodePropertyName =
  | "gc" // General_Category
  | "sc" // Script
  | "scx" // Script_Extensions
  | "bp"; // Binary_Property

const unicodePropertyLongNames: {
  [K in ShortUnicodePropertyName]: string;
} = {
  gc: "General_Category",
  sc: "Script",
  scx: "Script_Extensions",
  bp: "Binary_Property",
};

const unicodeDataMappingKeys: {
  [K in ShortUnicodePropertyName]: { [key: string]: number };
} = {
  gc: {},
  sc: {},
  scx: {},
  bp: {},
};

const addCodePoints = async (
  ranges: number[][],
  pShortName: ShortUnicodePropertyName,
  pLongValue: string,
  pValues: string[]
) => {
  const pLongName = unicodePropertyLongNames[pShortName];
  if (unicodeDataMappingKeys[pShortName][pLongValue]) return;
  let codePoints: number[] | null = null;
  const tryLoad = async (v: string) => {
    try {
      codePoints = (await import(
        `@unicode/unicode-16.0.0/${pLongName}/${v}/code-points`
      ).then((m) => m.default)) as number[];
    } catch (e) {
      codePoints = null;
    }
  };
  await tryLoad(pLongValue);
  for (let i = 0; i < pValues.length && !codePoints; ++i) {
    await tryLoad(pValues[i]);
  }
  if (!codePoints) return;
  const rangeIndex = ranges.length;
  ranges.push([...encodeCodePoints(codePoints as number[])]);
  for (const v of pValues) {
    unicodeDataMappingKeys[pShortName][v] = rangeIndex;
  }
};

const readlines = function* (text: string) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.match(/^[^#]*/)![0].trim();
    if (!trimmed) continue;
    yield trimmed;
  }
};
export async function generateUnicodeTable() {
  const ranges: number[][] = [];

  const propertyValueAliases = await fetch(
    `${unicodeBaseUrl}PropertyValueAliases.txt`
  ).then((r) => r.text());
  for (const line of readlines(propertyValueAliases)) {
    const [pShortName, ...pValues] = line.split(";").map((s) => s.trim());
    if (!unicodePropertyLongNames[pShortName as ShortUnicodePropertyName])
      continue;
    const pLongValue = pValues.toSorted((a, b) => b.length - a.length)[0];
    await addCodePoints(
      ranges,
      pShortName as ShortUnicodePropertyName,
      pLongValue,
      pValues
    );
    if (pShortName === "sc") {
      await addCodePoints(ranges, "scx", pLongValue, pValues);
    }
  }
  const propertyAliases = await fetch(
    `${unicodeBaseUrl}PropertyAliases.txt`
  ).then((r) => r.text());
  const binaryProperties = propertyAliases.match(
    /# Binary Properties\n#.+\n([\s\S]+?)\n# =/
  )![1];
  for (const line of readlines(binaryProperties)) {
    const [...pValues] = line.split(";").map((s) => s.trim());
    const pLongValue = pValues.toSorted((a, b) => b.length - a.length)[0];
    await addCodePoints(ranges, "bp", pLongValue, pValues);
  }
  for (const pLongValue of unicodeCategories.Binary_Property) {
    await addCodePoints(ranges, "bp", pLongValue, [pLongValue]);
  }
  for (const pLongValue of unicodeCategories.General_Category) {
    await addCodePoints(ranges, "gc", pLongValue, [pLongValue]);
  }
  const caseFolding = await fetch(
    "https://www.unicode.org/Public/16.0.0/ucd/CaseFolding.txt"
  ).then((response) => response.text());
  let caseFoldingEntries: {
    nFrom: number;
    nDiff: number;
    nJump?: number;
    nRepeat: number;
  }[] = [];
  let nBefJump = -1;
  let setMapped = new Set<string>();
  let extraCaseFolding: { nFrom: number; nDiff: number }[] = [];
  let extraUnicodeCaseFolding: { nFrom: number; nDiff: number }[] = [];
  for (const line of readlines(caseFolding)) {
    let [strFrom, type, strTo] = line.split(/;\s*/);
    if (type !== "C" && type !== "S") continue;
    let nFrom = parseInt(strFrom, 16);
    let nTo = parseInt(strTo, 16);
    let cFrom = String.fromCodePoint(nFrom);
    let cTo = String.fromCodePoint(nTo);
    const isExtraUnicodeMap =
      nFrom <= 0xffff &&
      nTo <= 0xffff &&
      !new RegExp(
        `^\\u${strFrom.padStart(4, "0")}\\u${strTo.padStart(4, "0")}$`,
        "i"
      ).test(cTo + cFrom);
    let nDiff = nTo - nFrom;
    if (nDiff < 0) {
      [nFrom, nTo] = [nTo, nFrom];
      [cFrom, cTo] = [cTo, cFrom];
      [strFrom, strTo] = [strTo, strFrom];
      nDiff = -nDiff;
    }
    if (setMapped.has(strFrom) || setMapped.has(strTo) || isExtraUnicodeMap) {
      (isExtraUnicodeMap ? extraUnicodeCaseFolding : extraCaseFolding).push({
        nFrom,
        nDiff,
      });
      continue;
    }
    setMapped.add(strFrom);
    setMapped.add(strTo);
    const bef = caseFoldingEntries[caseFoldingEntries.length - 1];
    const nJump = nFrom - (bef?.nFrom ?? nFrom);
    if (
      (bef?.nJump === undefined || nJump === nBefJump) &&
      bef?.nDiff === nDiff
    ) {
      bef.nJump = nJump;
      bef.nRepeat++;
    } else {
      caseFoldingEntries.push({
        nFrom,
        nDiff,
        nRepeat: 1,
      });
    }
    nBefJump = nJump;
  }
  const noRepeatCaseFolding = caseFoldingEntries
    .filter((c) => c.nRepeat === 1)
    .map(({ nFrom, nDiff }) => [nFrom, nDiff]);
  let nBefFrom = 0;
  const repeatCaseFolding = caseFoldingEntries
    .filter((c) => c.nRepeat > 1)
    .sort((a, b) => a.nFrom - b.nFrom)
    .map(({ nFrom, nDiff, nRepeat, nJump }) => {
      const nRelFrom = nFrom - nBefFrom;
      nBefFrom = nFrom;
      return [nRelFrom, nDiff, nRepeat, nJump!];
    });
  console.log(`unicodeMapping entries: ${ranges.length}`);
  console.log(`noRepeatCaseFolding entries: ${noRepeatCaseFolding.length}`);
  console.log(`repeatCaseFolding entries: ${repeatCaseFolding.length}`);
  console.log(`extraCaseFolding entries: ${extraCaseFolding.length}`);
  console.log(
    `extraUnicodeCaseFolding entries: ${extraUnicodeCaseFolding.length}`
  );
  ranges.push(noRepeatCaseFolding.flat(1));
  ranges.push(repeatCaseFolding.flat(1));
  let nBefExtraCaseFoldingFrom = 0;
  ranges.push(
    extraCaseFolding
      .toSorted((a, b) => a.nFrom - b.nFrom)
      .map(({ nFrom, nDiff }) => {
        const r = [nFrom - nBefExtraCaseFoldingFrom, nDiff];
        nBefExtraCaseFoldingFrom = nFrom;
        return r;
      })
      .flat(1)
  );
  let nBefExtraUnicodeCaseFoldingFrom = 0;
  ranges.push(
    extraUnicodeCaseFolding
      .toSorted((a, b) => a.nFrom - b.nFrom)
      .map(({ nFrom, nDiff }) => {
        const r = [nFrom - nBefExtraUnicodeCaseFoldingFrom, nDiff];
        nBefExtraUnicodeCaseFoldingFrom = nFrom;
        return r;
      })
      .flat(1)
  );
  // 122104 bytes of BER data
  const savePath = "src/unicode/generatedTable.ts";
  fs.writeFileSync(
    savePath,
    `
import { decodeBERBinary } from "./ber";
import { decodeExb64 } from "./exb64";
import { decodeRanges } from "./rangeUtils";

// This file is auto-generated. Do not edit manually.

const decoded = decodeBERBinary(decodeExb64("${encodeExb64(
      encodeBERBinary(ranges)
    )}"));
let cur = decoded.length - 4;
export const unicodeRange = decodeRanges(decoded.slice(0, cur));
export const noRepeatCaseFolding = decoded[cur];
export const repeatCaseFolding = decoded[++cur];
export const extraCaseFolding = decoded[++cur];
export const extraUnicodeCaseFolding = decoded[++cur];
export const unicodeCategoriesMap = ${JSON.stringify(
      unicodeDataMappingKeys,
      null,
      2
    )};
`
  );
  console.log(`saved to ${savePath}.`);
  console.log(`total size: ${fs.statSync(savePath).size} bytes`);
}

generateUnicodeTable();
