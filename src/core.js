const PLACEHOLDER_REGEX = /%([%sdif])/g;

/**
 * Parses a printf-style log format string into literal segments and placeholder descriptors.
 *
 * Design decision: The parser recognises exactly four conversions: `%%` (literal percent),
 * `%s` (string), `%d` (integer), and `%i` (integer). `%i` is treated identically to `%d`
 * because structured logging systems commonly accept both, and the distinction between
 * signed and unsigned is not useful at the template level. Any other `%` sequence is
 * treated as a literal `%` followed by the remaining characters. This avoids throwing on
 * unknown conversions, which is important for forward compatibility with log formats that
 * may include vendor-specific extensions.
 *
 * The function returns an array of segments. A segment is either:
 *   - `{ type: 'literal', value: string }` for literal text
 *   - `{ type: 'placeholder', specifier: 's' | 'd' | 'i' }` for a placeholder
 *
 * Adjacent literals are merged into a single literal segment. Placeholders are never merged.
 *
 * @param {string} template - The printf-style format string.
 * @returns {Array<{type: 'literal', value: string} | {type: 'placeholder', specifier: string}>}
 * @throws {TypeError} If `template` is not a string.
 */
export function parseTemplate(template) {
  if (typeof template !== 'string') {
    throw new TypeError('template must be a string');
  }

  const segments = [];
  let lastIndex = 0;
  let match;

  PLACEHOLDER_REGEX.lastIndex = 0;
  while ((match = PLACEHOLDER_REGEX.exec(template)) !== null) {
    const [fullMatch, specifier] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      segments.push({ type: 'literal', value: template.slice(lastIndex, matchIndex) });
    }

    if (specifier === '%') {
      // `%%` produces a literal percent sign. Merge with previous literal if possible.
      const previous = segments[segments.length - 1];
      if (previous && previous.type === 'literal') {
        previous.value += '%';
      } else {
        segments.push({ type: 'literal', value: '%' });
      }
    } else {
      segments.push({ type: 'placeholder', specifier });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < template.length) {
    const tail = template.slice(lastIndex);
    const previous = segments[segments.length - 1];
    if (previous && previous.type === 'literal') {
      previous.value += tail;
    } else {
      segments.push({ type: 'literal', value: tail });
    }
  }

  return segments;
}
