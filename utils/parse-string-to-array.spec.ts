import { describe, it, expect } from '@jest/globals';
import { ParseStringToArray } from './parse-string-to-array';

describe('parse-input-string-to-array', () => {
  describe('ParseInputStringToArray', () => {
    it(`should parse multiline string to array`, () => {
      expect(ParseStringToArray(`foo\nbar\nbaz\nqux`)).toEqual([
        'foo',
        'bar',
        'baz',
        'qux',
      ]);
    });

    it(`should parse with custom delimiter`, () => {
      expect(ParseStringToArray(`foo|bar|baz|qux`, { delimiter: '|' })).toEqual(
        ['foo', 'bar', 'baz', 'qux'],
      );
    });

    it(`should trim whitespace`, () => {
      expect(ParseStringToArray(`foo\n  bar\n  baz\n  qux  `)).toEqual([
        'foo',
        'bar',
        'baz',
        'qux',
      ]);
    });

    it(`shouldn't trim whitespace`, () => {
      expect(
        ParseStringToArray(`foo\n  bar\n  baz\n  qux  `, { trim: false }),
      ).toEqual(['foo', '  bar', '  baz', '  qux  ']);
    });

    it(`should return an empty array for no input`, () => {
      expect(ParseStringToArray(undefined)).toEqual([]);
      expect(ParseStringToArray(``)).toEqual([]);
    });
  });
});
