import {describe, expect, test} from 'bun:test';
import {validateSelectedCodecAndProResCombination} from '../prores-profile';

describe('Pro Res Profile', () => {
	test("Just a ProRes profile is not enough, because codec doesn't default to ProRes", () => {
		expect(() => {
			validateSelectedCodecAndProResCombination({
				codec: 'aac',
				proResProfile: '4444-xq',
			});
		}).toThrow(
			/You have set a ProRes profile but the codec is "aac". Set the codec to "prores" or remove the ProRes profile./,
		);
	});

	test('Should accept a valid codec and ProRes combination', () => {
		expect(
			validateSelectedCodecAndProResCombination({
				codec: 'prores',
				proResProfile: '4444',
			}),
		).toBe(undefined);
	});

	test('Should throw on invalid ProRes name', () => {
		expect(() =>
			validateSelectedCodecAndProResCombination({
				codec: 'prores',
				// @ts-expect-error
				proResProfile: 'typoed',
			}),
		).toThrow(
			/The ProRes profile "typoed" is not valid. Valid options are "4444-xq", "4444", "hq", "standard", "light", "proxy"/,
		);
	});
});
