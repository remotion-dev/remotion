import {describe, expect, test} from 'vitest';
import type {ProResProfile} from '../config/prores-profile';
import {
	getProResProfile,
	setProResProfile,
	validateSelectedCodecAndProResCombination,
} from '../config/prores-profile';
import {expectToThrow} from './expect-to-throw';

describe('Pro Res Profile', () => {
	const validProResProfile: ProResProfile = 'standard';

	test('Should be able to set a ProRes profile', () => {
		setProResProfile(validProResProfile);
		expect(getProResProfile()).toBe(validProResProfile);
	});

	test("Just a ProRes profile is not enough, because codec doesn't default to ProRes", () => {
		expectToThrow(() => {
			validateSelectedCodecAndProResCombination('aac', '4444-xq');
		}, /You have set a ProRes profile but the codec is not "prores". Set the codec to "prores" or remove the ProRes profile./);
	});

	test('Should accept a valid codec and ProRes combination', () => {
		expect(validateSelectedCodecAndProResCombination('prores', '4444')).toBe(
			undefined
		);
	});

	test('Should throw on invalid ProRes name', () => {
		expectToThrow(
			() =>
				// @ts-expect-error
				validateSelectedCodecAndProResCombination('prores', 'typoed'),
			/The ProRes profile "typoed" is not valid. Valid options are "4444-xq", "4444", "hq", "standard", "light", "proxy"/
		);
	});
});
