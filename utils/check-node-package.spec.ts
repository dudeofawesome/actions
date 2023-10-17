import { describe, it, expect } from '@jest/globals';
import { CheckNodePackage } from './check-node-package';

describe('check-node-package', () => {
  describe('CheckNodePackage', () => {
    it(`should validate a good node package`, () => {
      const pkg = { name: 'foo', version: '1.0.0' };
      expect(CheckNodePackage(pkg)).toEqual(pkg);
    });

    it(`should throw on an invalid node package`, () => {
      expect(() => CheckNodePackage('foo')).toThrow();
    });
  });
});
