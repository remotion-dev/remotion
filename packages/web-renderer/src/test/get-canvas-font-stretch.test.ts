import {expect, test} from 'vitest';
import {getCanvasFontStretch} from '../drawing/text/get-canvas-font-stretch';

test('should convert computed CSS font stretch values to canvas keywords', () => {
	const testCases = [
		['normal', 'normal'],
		['condensed', 'condensed'],
		['50%', 'ultra-condensed'],
		['62.5%', 'extra-condensed'],
		['75%', 'condensed'],
		['87.5%', 'semi-condensed'],
		['100%', 'normal'],
		['112.5%', 'semi-expanded'],
		['125%', 'expanded'],
		['150%', 'extra-expanded'],
		['200%', 'ultra-expanded'],
		['0%', 'ultra-condensed'],
		['80%', 'condensed'],
		['81.25%', 'condensed'],
		['106.25%', 'semi-expanded'],
		['250%', 'ultra-expanded'],
		['invalid', 'normal'],
	] as const satisfies readonly (readonly [string, CanvasFontStretch])[];

	for (const [input, expected] of testCases) {
		expect(getCanvasFontStretch(input), input).toBe(expected);
	}
});
