export enum CharClassType {
  Char = 0,
  Range = 1,
}
export type CharClassChar = { _type: CharClassType.Char; _cp: number };
export type CharClassRange = {
  _type: CharClassType.Range;
  _start: number;
  _end: number;
};
export type CharClassItem = CharClassChar | CharClassRange;

export type GroupModFlags = {
  [K in "i" | "m" | "s"]?: true;
};
export enum RegExpNodeType {
  Literal = 0,
  CharClass = 1,
  Group = 2,
  Backref = 3,
  Repeat = 4,
  Alt = 5,
  Concat = 6,
  Assertion = 7,
}
export type RegExpNode =
  | { _type: RegExpNodeType.Literal; _value: string }
  | {
      _type: RegExpNodeType.CharClass;
      _cls: string;
      _wildcard: boolean;
      _negate: boolean;
    }
  | {
      _type: RegExpNodeType.Group;
      _name: string | null;
      _children: RegExpNode[];
      _capturing: boolean;
      _groupIndex: number | null;
      _assertion:
        | "lookahead"
        | "negativeLookahead"
        | "lookbehind"
        | "negativeLookbehind"
        | null;
      _addFlags: GroupModFlags | null;
      _subFlags: GroupModFlags | null;
    }
  | { _type: RegExpNodeType.Backref; _ref: number | string }
  | {
      _type: RegExpNodeType.Repeat;
      _min: number;
      _max: number;
      _greedy: boolean;
      _child: RegExpNode;
    }
  | { _type: RegExpNodeType.Alt; _alts: RegExpNode[][] }
  | { _type: RegExpNodeType.Concat; _children: RegExpNode[] }
  | { _type: RegExpNodeType.Assertion; _symbol: "^" | "$" | "\\b" | "\\B" };
