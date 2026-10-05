import {describe, expect, test} from 'bun:test';
import {getAacPrimingInputArgs} from '../aac-priming';

describe('AAC priming compensation', () => {
	test('Shifts AAC input back by 2048 samples at 48kHz', () => {
		expect(
			getAacPrimingInputArgs({
				audioCodec: 'aac',
				sampleRate: 48000,
				outputExtension: 'mp4',
			}),
		).toEqual(['-itsoffset', '-42667us']);
	});
	test('Scales with the sample rate', () => {
		expect(
			getAacPrimingInputArgs({
				audioCodec: 'aac',
				sampleRate: 44100,
				outputExtension: 'mov',
			}),
		).toEqual(['-itsoffset', '-46440us']);
	});
	test('Leaves other audio codecs untouched', () => {
		expect(
			getAacPrimingInputArgs({
				audioCodec: 'opus',
				sampleRate: 48000,
				outputExtension: 'mp4',
			}),
		).toEqual([]);
	});
	test('Leaves containers without edit lists untouched', () => {
		expect(
			getAacPrimingInputArgs({
				audioCodec: 'aac',
				sampleRate: 48000,
				outputExtension: 'mkv',
			}),
		).toEqual([]);
	});
});
