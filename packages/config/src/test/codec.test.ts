import type {CodecOrUndefined} from '@remotion/renderer';
import {describe, expect, test} from 'vitest';
import {getOutputCodecOrUndefined, setCodec} from '../config/codec';
import {expectToThrow} from './expect-to-throw';

// setCodec

describe('Codec tests setOutputFormat', () => {
	const validCodecInputs: CodecOrUndefined[] = [
		'h264',
		'h265',
		'vp8',
		'vp9',
		undefined,
	];
	validCodecInputs.forEach((entry) =>
		test(`testing with ${entry}`, () => {
			setCodec(entry);
			expect(getOutputCodecOrUndefined()).toEqual(entry);
		})
	);
	test('setCodec with invalid coded', () => {
		expectToThrow(
			// @ts-expect-error
			() => setCodec('invalid'),
			/Codec must be one of the following:/
		);
	});
});
