import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTemplate } from '../src/index.js';

test('empty string yields no segments', () => {
  assert.deepEqual(parseTemplate(''), []);
});

test('plain text without placeholders yields one literal', () => {
  assert.deepEqual(parseTemplate('hello world'), [
    { type: 'literal', value: 'hello world' },
  ]);
});

test('single string placeholder', () => {
  assert.deepEqual(parseTemplate('hello %s'), [
    { type: 'literal', value: 'hello ' },
    { type: 'placeholder', specifier: 's' },
  ]);
});

test('integer placeholder', () => {
  assert.deepEqual(parseTemplate('count: %d'), [
    { type: 'literal', value: 'count: ' },
    { type: 'placeholder', specifier: 'd' },
  ]);
});

test('%i is treated as an integer placeholder', () => {
  assert.deepEqual(parseTemplate('id=%i'), [
    { type: 'literal', value: 'id=' },
    { type: 'placeholder', specifier: 'i' },
  ]);
});

test('multiple placeholders in one template', () => {
  assert.deepEqual(parseTemplate('%s scored %d points'), [
    { type: 'placeholder', specifier: 's' },
    { type: 'literal', value: ' scored ' },
    { type: 'placeholder', specifier: 'd' },
    { type: 'literal', value: ' points' },
  ]);
});

test('escaped percent becomes a literal percent', () => {
  assert.deepEqual(parseTemplate('100%% complete'), [
    { type: 'literal', value: '100% complete' },
  ]);
});

test('escaped percent adjacent to text merges into one literal', () => {
  assert.deepEqual(parseTemplate('a%%b'), [
    { type: 'literal', value: 'a%b' },
  ]);
});

test('unknown conversion is left as literal percent plus following characters', () => {
  assert.deepEqual(parseTemplate('value: %q'), [
    { type: 'literal', value: 'value: %q' },
  ]);
});

test('trailing percent is literal', () => {
  assert.deepEqual(parseTemplate('trailing %'), [
    { type: 'literal', value: 'trailing %' },
  ]);
});

test('placeholder at the very beginning', () => {
  assert.deepEqual(parseTemplate('%s rest'), [
    { type: 'placeholder', specifier: 's' },
    { type: 'literal', value: ' rest' },
  ]);
});

test('placeholder at the very end', () => {
  assert.deepEqual(parseTemplate('rest %s'), [
    { type: 'literal', value: 'rest ' },
    { type: 'placeholder', specifier: 's' },
  ]);
});

test('consecutive placeholders', () => {
  assert.deepEqual(parseTemplate('%s%d'), [
    { type: 'placeholder', specifier: 's' },
    { type: 'placeholder', specifier: 'd' },
  ]);
});

test('non-string input throws TypeError', () => {
  assert.throws(() => parseTemplate(null), TypeError);
  assert.throws(() => parseTemplate(42), TypeError);
  assert.throws(() => parseTemplate(undefined), TypeError);
});

test('regex lastIndex is reset between calls', () => {
  const first = parseTemplate('%s');
  const second = parseTemplate('%s');
  assert.deepEqual(first, second);
});
