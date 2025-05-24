# regexp-dummy-generator

`regexp-dummy-generator` is a JavaScript library that generates dummy strings matching a given regular expression.  
It is useful for testing, prototyping, and demonstration purposes.

## Playground

Try it out in your browser!  
https://mochiya98.github.io/regexp-dummy-generator/

## Usage

```ts
import { newDummyGenerator } from "regexp-dummy-generator";

const generator = newDummyGenerator(/[A-Za-z0-9]{50}/u, {
  defaultMaxRepeat: 10,
  allLettersRangeClass: "\\x21-\\x7E",
});
console.log(generator());
```

- `defaultMaxRepeat` (number):  
  The default maximum number of repetitions for quantifiers like `{n,}` or `*`.  
  Default: `10`

- `allLettersRangeClass` (string):  
  The character range used for `.`, `\S`, etc.  
  Default: `\u0000-\uffff` / `\u{0000}-\u{10ffff}` (u flag)

## License

MIT
