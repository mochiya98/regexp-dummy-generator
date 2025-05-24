import { GroupModFlags, RegExpNode, RegExpNodeType } from "./types";

export const parseRegExp = (src: string, unicode = false): RegExpNode => {
  let text: string | string[] = unicode ? [...src] : src;
  let i = 0;
  let curGroupIndex = 0;
  let curGroupCount = 0;
  let hasNamedGroups = false;

  const _slice = (start: number, end?: number): string => {
    if (Array.isArray(text)) {
      return text.slice(start, end).join("");
    } else {
      return text.slice(start, end);
    }
  };

  const _parseCharClass = (): RegExpNode => {
    let negate = false;
    let j = i + 1;
    if (text[j] === "^") {
      negate = true;
      j++;
    }
    let cls = "";
    while (j < text.length && text[j] !== "]") {
      if (text[j] === "\\" && j + 1 < text.length) {
        cls += text[j] + text[j + 1];
        j += 2;
      } else {
        cls += text[j];
        j++;
      }
    }
    //if (_text[j] !== "]") throw new Error("Missing closing ']' for character class");
    i = j + 1;
    return {
      _type: RegExpNodeType.CharClass,
      _cls: cls,
      _wildcard: false,
      _negate: negate,
    };
  };

  const _parseGroup = (): RegExpNode => {
    const src = text;
    //if (src[i] !== "(")
    //  throw new Error("Not a group start '('");
    let capturing = true;
    let name: string | null = null;
    let assertion:
      | "lookahead"
      | "negativeLookahead"
      | "lookbehind"
      | "negativeLookbehind"
      | null = null;
    let addFlags: GroupModFlags | null = null;
    let subFlags: GroupModFlags | null = null;
    i++;
    if (src[i] === "?") {
      if (src[i + 1] === "=") {
        assertion = "lookahead";
        capturing = false;
        i += 2;
      } else if (src[i + 1] === "!") {
        assertion = "negativeLookahead";
        capturing = false;
        i += 2;
      } else if (src[i + 1] === "<") {
        if (src[i + 2] === "=") {
          assertion = "lookbehind";
          capturing = false;
          i += 3;
        } else if (src[i + 2] === "!") {
          assertion = "negativeLookbehind";
          capturing = false;
          i += 3;
        } else {
          // named capturing group
          let j = i + 2;
          let nm = "";
          while (j < src.length && src[j] !== ">") nm += src[j++];
          //if (src[j] !== ">") throw new Error("Invalid capture group name");
          name = nm;
          capturing = true;
          i = j + 1;
        }
      } else if (src[i + 1] === ":") {
        capturing = false;
        i += 2;
      } else {
        const matchModFlags = _slice(i + 1).match(
          /^(?:([ims]+)|)(?:-(?:([ims]+)|)|):/
        );
        if (matchModFlags) {
          capturing = false;
          if (matchModFlags[1]) {
            addFlags = {};
            for (const f of [...matchModFlags[1]]) {
              addFlags[f as keyof GroupModFlags] = true;
            }
          }
          if (matchModFlags[2]) {
            subFlags = {};
            for (const f of [...matchModFlags[2]]) {
              subFlags[f as keyof GroupModFlags] = true;
            }
          }
          i += matchModFlags[0].length + 1;
        }
        /*
        } else {
          _i += 1;
        }
        */
      }
    }
    let groupIndex: number | null = null;
    if (capturing) {
      groupIndex = curGroupIndex;
      curGroupIndex++;
      if (name) hasNamedGroups = true;
    }
    const children = _parseAlt();
    // if (text[i] !== ")") throw new Error("Unterminated group");
    i++;
    return {
      _type: RegExpNodeType.Group,
      _name: name,
      _children: children,
      _capturing: capturing,
      _groupIndex: groupIndex,
      _assertion: assertion,
      _addFlags: addFlags,
      _subFlags: subFlags,
    };
  };

  const _parseOtherEscapes = (): RegExpNode => {
    let esc = _slice(i, i + 2);
    if (/^\\[dDsSwW]$/.test(esc)) {
      i += 2;
      return {
        _type: RegExpNodeType.CharClass,
        _cls: esc,
        _wildcard: false,
        _negate: false,
      };
    } else {
      let match = _slice(i).match(
        unicode
          ? /^\\(?:x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|u\{[0-9A-Fa-f]{1,6}\}|c[A-Za-z]|(?=c)|.?)/
          : /^\\(?:x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|(?=c)|.?)/
      )!;
      i += match[0].length;
      return { _type: RegExpNodeType.Literal, _value: match[0] };
    }
  };

  const _parseSeq = (): RegExpNode[] => {
    const src = text;
    const nodes: RegExpNode[] = [];
    while (i < text.length && text[i] !== ")" && text[i] !== "|") {
      if (src[i] === "^") {
        nodes.push({ _type: RegExpNodeType.Assertion, _symbol: "^" });
        i++;
      } else if (src[i] === "$") {
        nodes.push({ _type: RegExpNodeType.Assertion, _symbol: "$" });
        i++;
      } else if (src[i] === "[") {
        nodes.push(_parseCharClass());
      } else if (src[i] === "(") {
        nodes.push(_parseGroup());
      } else if (src[i] === ".") {
        nodes.push({
          _type: RegExpNodeType.CharClass,
          _cls: ".",
          _wildcard: true,
          _negate: false,
        });
        i++;
      } else if (src[i] === "\\") {
        if (src[i + 1] === "b") {
          nodes.push({ _type: RegExpNodeType.Assertion, _symbol: "\\b" });
          i += 2;
        } else if (src[i + 1] === "B") {
          nodes.push({ _type: RegExpNodeType.Assertion, _symbol: "\\B" });
          i += 2;
        } else if (src[i + 1] && /[0-9]/.test(src[i + 1])) {
          const afterText = _slice(i + 1);
          const idxText = afterText.match(/^0|[1-9][0-9]{0,3}/)![0];
          const ref = Number(idxText);
          if (ref !== 0 && curGroupCount >= ref) {
            nodes.push({ _type: RegExpNodeType.Backref, _ref: ref });
            i += 1 + idxText.length;
          } else {
            const octalText = afterText.match(/^[0-3]?[0-7]{0,2}/)![0];
            if (octalText.length) {
              nodes.push({
                _type: RegExpNodeType.Literal,
                _value: `\\${octalText}`,
              });
              i += 1 + octalText.length;
            } else {
              nodes.push(_parseOtherEscapes());
            }
          }
        } else if (src[i + 1] === "k" && src[i + 2] === "<" && hasNamedGroups) {
          let j = i + 3;
          let name = "";
          while (j < src.length && src[j] !== ">") name += src[j++];
          nodes.push({ _type: RegExpNodeType.Backref, _ref: name });
          i = j + 1;
        } else if (
          (src[i + 1] === "p" || src[i + 1] === "P") &&
          src[i + 2] === "{" &&
          unicode
        ) {
          let j = i + 3;
          let name = "";
          while (j < src.length && src[j] !== "}") name += src[j++];
          nodes.push({
            _type: RegExpNodeType.CharClass,
            _cls: `\\${src[i + 1]}{${name}}`,
            _wildcard: false,
            _negate: false,
          });
          i = j + 1;
        } else {
          nodes.push(_parseOtherEscapes());
        }
      } else if (src[i] === "{") {
        const match = _slice(i + 1)
          .match(/^([0-9]+)(?:(,)([0-9]+)?)?\}(\?)?/)
          ?.slice(0);
        if (match) {
          const [matched, minText, comma, maxText, notGreedy] = match;
          const min = Number(minText);
          const max = comma ? (maxText ? Number(maxText) : Infinity) : min;
          const prev = nodes.pop()!;
          //if (!prev) throw new Error("Nothing to repeat");
          nodes.push({
            _type: RegExpNodeType.Repeat,
            _min: min,
            _max: max,
            _greedy: !notGreedy,
            _child: prev,
          });
          i += matched.length + 1;
        } else {
          nodes.push({ _type: RegExpNodeType.Literal, _value: src[i] });
          i++;
        }
      } else if (src[i] === "+" || src[i] === "*") {
        let greedy = true;
        let j = i;
        if (src[i + 1] === "?") {
          greedy = false;
          j++;
        }
        const prev = nodes.pop()!;
        //if (!prev) throw new Error("Nothing to repeat");
        nodes.push({
          _type: RegExpNodeType.Repeat,
          _min: src[i] === "+" ? 1 : 0,
          _max: Infinity,
          _greedy: greedy,
          _child: prev,
        });
        i = j + 1;
      } else if (src[i] === "?") {
        let greedy = true;
        if (src[i + 1] === "?") {
          greedy = false;
          i++;
        }
        const prev = nodes.pop()!;
        //if (!prev) throw new Error("Nothing to repeat");
        nodes.push({
          _type: RegExpNodeType.Repeat,
          _min: 0,
          _max: 1,
          _greedy: greedy,
          _child: prev,
        });
        i++;
      } else {
        nodes.push({ _type: RegExpNodeType.Literal, _value: src[i] });
        i++;
      }
    }
    return nodes.reduce((acc: RegExpNode[], node) => {
      if (node._type === RegExpNodeType.Literal && acc.length > 0) {
        const last = acc[acc.length - 1];
        if (last._type === RegExpNodeType.Literal) {
          last._value += node._value;
          return acc;
        }
      }
      acc.push(node);
      return acc;
    }, []);
  };

  const _parseAlt = (): RegExpNode[] => {
    const alts: RegExpNode[][] = [];
    while (true) {
      const seq = _parseSeq();
      alts.push(seq);
      if (text[i] === "|") {
        i++;
        continue;
      }
      break;
    }
    if (alts.length === 1) return alts[0];
    return [{ _type: RegExpNodeType.Alt, _alts: alts }];
  };

  const _parse = (prepare: boolean): RegExpNode => {
    i = 0;
    curGroupIndex = 0;
    const children = _parseAlt();
    if (prepare) curGroupCount = curGroupIndex;
    if (children.length === 1) return children[0];
    return { _type: RegExpNodeType.Concat, _children: children };
  };

  _parse(true);
  return _parse(false);
};
