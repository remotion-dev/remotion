import type {CodecOrUndefined} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, expect, test} from 'bun:test';
import {expectToThrow} from './expect-to-throw';

// setCodec

describe('Codec tests setCodec', () => {
	const validCodecInputs: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		undefined,
	];
	validCodecInputs.forEach((entry) =>
		test(`testing with ${entry}`, () => {
			BrowserSafeApis.options.videoCodecOption.setConfig(entry);
			expect(BrowserSafeApis.getOutputCodecOrUndefined()).toEqual(entry!);
		}),
	);
	test('setCodec with invalid coded', () => {
		expectToThrow(
			// @ts-expect-error
			() => BrowserSafeApis.options.videoCodecOption.setConfig('invalid'),
			/Codec must be one of the following:/,
		);
	});
});
