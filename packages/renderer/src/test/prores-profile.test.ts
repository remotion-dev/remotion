import {describe, expect, test} from 'vitest';
import {validateSelectedCodecAndProResCombination} from '../prores-profile';

describe('Pro Res Profile', () => {
	test("Just a ProRes profile is not enough, because codec doesn't default to ProRes", () => {
		expect(() => {
			validateSelectedCodecAndProResCombination('aac', '4444-xq');
		}).toThrow(
			/You have set a ProRes profile but the codec is not "prores". Set the codec to "prores" or remove the ProRes profile./
		);
	});

	test('Should accept a valid codec and ProRes combination', () => {
		expect(validateSelectedCodecAndProResCombination('prores', '4444')).toBe(
			undefined
		);
	});

	test('Should throw on invalid ProRes name', () => {
		expect(() =>
			// @ts-expect-error
			validateSelectedCodecAndProResCombination('prores', 'typoed')
		).toThrow(
			/The ProRes profile "typoed" is not valid. Valid options are "4444-xq", "4444", "hq", "standard", "light", "proxy"/
		);
	});
});
