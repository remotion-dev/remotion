import {expect, test} from 'bun:test';
import {ENABLE_V5_BREAKING_CHANGES, resolveV5Default} from '../v5-flag.js';

test('resolves a v5 default while preserving explicit values', () => {
	expect(resolveV5Default(undefined)).toBe(ENABLE_V5_BREAKING_CHANGES);
	expect(resolveV5Default(false)).toBe(false);
	expect(resolveV5Default(true)).toBe(true);
});
