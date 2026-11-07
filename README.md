# structured-log-template-parser

Parses printf-style log format strings into literal segments and placeholder descriptors for structured logging.

```js
import { parseTemplate } from 'structured-log-template-parser';

const segments = parseTemplate('user %s logged in from %s');
// [
//   { type: 'literal', value: 'user ' },
//   { type: 'placeholder', specifier: 's' },
//   { type: 'literal', value: ' logged in from ' },
//   { type: 'placeholder', specifier: 's' },
// ]
```

## Why this exists

Structured logging pipelines often receive a printf-style format string and a list of arguments. To attach the arguments to the correct fields in a log record, the pipeline needs to know where the placeholders are and what type each one expects. This library performs that split without pulling in a printf implementation or a parsing framework.

The trade-off is that the parser recognises only `%%`, `%s`, `%d`, and `%i`. Formatting flags, width, precision, and positional arguments (`%1$s`) are not supported; they are treated as literal text. This keeps the parser small and predictable, and it means an unrecognised conversion never throws — it simply becomes part of a literal segment. If you need full printf semantics, this is not the library for you.

## The awkward edge

A lone `%` at the end of a string, or a `%` followed by any character other than `%`, `s`, `d`, or `i`, is emitted as a literal `%` and the following characters are emitted as literal text. For example, `parseTemplate('value: %q')` returns a single literal segment `'value: %q'`. This means the parser never fails on malformed input, but it also means callers cannot distinguish an escaped percent from an unrecognised conversion by looking at the output alone. If that distinction matters, validate the template before parsing.

## API

### `parseTemplate(template: string): Segment[]`

Returns an array of segments. Each segment is either:

- `{ type: 'literal', value: string }`
- `{ type: 'placeholder', specifier: 's' | 'd' | 'i' }`

Adjacent literal text is merged into a single literal segment. Placeholders are never merged. Throws a `TypeError` if `template` is not a string.
