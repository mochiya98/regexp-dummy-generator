export const strToCharTokens = (str: string, unicode: boolean) =>
  unicode
    ? (str.match(
        /\\(?:[dDwWsS]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{1,6}\}|[pP]\{[A-Za-z0-9_=]+\}|c[A-Za-z]|[0-3]?[0-7]{1,2}|[^c])|[\s\S]/gu
      )! as string[])
    : (str.match(
        /\\(?:[dDwWsS]|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[0-3]?[0-7]{1,2}|[^c])|[\s\S]/g
      )! as string[]);

const spCharEscapeMap: { [key: string]: number } = {
  t: 0x09,
  n: 0x0a,
  r: 0x0d,
  v: 0x0b,
  f: 0x0c,
};

export const charTokenToCodePoint = (charToken: string): number => {
  if (/^\\x([0-9A-Fa-f]{2})$/.test(charToken)) {
    return parseInt(charToken.slice(2), 16);
  } else if (/^\\u([0-9A-Fa-f]{4})$/.test(charToken)) {
    return parseInt(charToken.slice(2), 16);
  } else if (/^\\u\{([0-9A-Fa-f]{1,6})\}$/.test(charToken)) {
    return parseInt(charToken.match(/^\\u\{([0-9A-Fa-f]{1,6})\}$/)![1], 16);
  } else if (/^\\c[A-Za-z]$/.test(charToken)) {
    return charToken[2].codePointAt(0)! & 0x1f;
  } else if (/^\\[0-3]?[0-7]{1,2}$/.test(charToken)) {
    return parseInt(charToken.slice(1), 8);
  } else if (/^\\./.test(charToken)) {
    const c = charToken.slice(1);
    return spCharEscapeMap[c] ?? c.codePointAt(0)!;
  } else {
    return charToken.codePointAt(0)!;
  }
};
