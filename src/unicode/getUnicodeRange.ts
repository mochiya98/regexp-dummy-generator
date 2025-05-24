import { CharClassItem } from "../types";
import { unicodeCategoriesMap, unicodeRange } from "./generatedTable";

const shortNameMapping: Record<string, string> = {
  Script: "sc",
  Script_Extensions: "scx",
  General_Category: "gc",
};

export const getUnicodeRange = (
  name: string | undefined,
  value: string
): CharClassItem[] => {
  const actualName =
    name !== undefined ? name : getUnicodeRange("bp", value) ? "bp" : "gc";
  return unicodeRange[
    (
      unicodeCategoriesMap as {
        [key: string]: { [key: string]: number };
      }
    )[shortNameMapping[actualName] || actualName]?.[value] as number
  ];
};
