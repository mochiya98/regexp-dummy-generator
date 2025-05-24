import { getRandomCaseCp } from "../unicode/getDifferentCase";

export const toRandomCase = (s: string, unicode: boolean) =>
  (s = [...s]
    .map((c) =>
      String.fromCodePoint(getRandomCaseCp(c.codePointAt(0)!, unicode))
    )
    .join(""));
