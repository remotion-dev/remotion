import {expect, test} from 'bun:test';
import {isPathInside} from '../serve-handler/is-path-inside';

test('allows child paths', () => {
	expect(isPathInside('/foo/bar', '/foo')).toBe(true);
	expect(isPathInside('/foo/bar/baz', '/foo')).toBe(true);
	expect(isPathInside('/foo/', '/foo')).toBe(true);
});

test('rejects paths outside parent', () => {
	expect(isPathInside('/bar', '/foo')).toBe(false);
	expect(isPathInside('/foo/../bar', '/foo')).toBe(false);
	expect(isPathInside('/foo/bar/../../../etc', '/foo')).toBe(false);
});

test('rejects sibling paths', () => {
	expect(isPathInside('/foo/../bar', '/foo')).toBe(false);
	expect(isPathInside('/foo/..', '/foo')).toBe(false);
});

test('handles trailing separators', () => {
	expect(isPathInside('/foo/bar/', '/foo/')).toBe(true);
	expect(isPathInside('/foo/../bar/', '/foo/')).toBe(false);
});
