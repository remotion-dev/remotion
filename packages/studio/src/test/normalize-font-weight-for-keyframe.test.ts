import {expect, test} from 'bun:test';
import {normalizeFontWeightForKeyframe} from '../components/Timeline/normalize-font-weight-for-keyframe';

test('normalizes font weights before keyframing', () => {
	expect(normalizeFontWeightForKeyframe(650)).toBe(650);
	expect(normalizeFontWeightForKeyframe('650')).toBe(650);
	expect(normalizeFontWeightForKeyframe('normal')).toBe(400);
	expect(normalizeFontWeightForKeyframe('bold')).toBe(700);
});

test('rejects font weights that cannot be interpolated', () => {
	expect(normalizeFontWeightForKeyframe('bolder')).toBe(null);
	expect(normalizeFontWeightForKeyframe('lighter')).toBe(null);
	expect(normalizeFontWeightForKeyframe('invalid')).toBe(null);
	expect(normalizeFontWeightForKeyframe(Number.NaN)).toBe(null);
});
