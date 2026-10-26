import {describe, expect, test} from 'bun:test';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {getCrfForCodec} from '../get-crf-for-codec';
import {expectToThrow} from './expect-to-throw';

describe('set crf invalid input', () => {
	const invalidInputs = [null, 'abc'];
	invalidInputs.forEach((entry) =>
		test(`test for ${entry}`, () =>
			expectToThrow(
				// @ts-expect-error
				() => BrowserSafeApis.options.crfOption.setConfig(entry),
				/The CRF must be a number or undefined/,
			)),
	);
});

describe('getCrfForCodec', () => {
	const base = {indent: false, logLevel: 'error' as const};

	(['wav', 'mp3', 'aac', 'prores', 'gif'] as const).forEach((codec) =>
		test(`ignores a config file CRF for ${codec}`, () =>
			expect(
				getCrfForCodec({...base, crf: 12, crfIsFromConfigFile: true, codec}),
			).toBe(null)),
	);

	test('keeps a config file CRF for h264', () =>
		expect(
			getCrfForCodec({
				...base,
				crf: 12,
				crfIsFromConfigFile: true,
				codec: 'h264',
			}),
		).toBe(12));

	test('keeps a --crf flag for wav so that it still gets rejected', () =>
		expect(
			getCrfForCodec({
				...base,
				crf: 12,
				crfIsFromConfigFile: false,
				codec: 'wav',
			}),
		).toBe(12));

	test('leaves an unset CRF alone', () =>
		expect(
			getCrfForCodec({
				...base,
				crf: undefined,
				crfIsFromConfigFile: true,
				codec: 'wav',
			}),
		).toBe(undefined));
});
