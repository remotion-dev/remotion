import {expect, test} from 'bun:test';
import type {InputAudioTrack} from 'mediabunny';
import {Mp3OutputFormat, Mp4OutputFormat} from 'mediabunny';
import {getAudioTranscodingOptions} from '../app/lib/can-transcode-or-copy';

const makeAudioTrack = (sampleRate: number) =>
	({
		codec: 'pcm-s16',
		canDecode: () => Promise.resolve(true),
		getSampleRate: () => Promise.resolve(sampleRate),
	}) as unknown as InputAudioTrack;

test('allows MP3 encoding when Mediabunny can resample to default encoder params', async () => {
	const options = await getAudioTranscodingOptions({
		inputTrack: makeAudioTrack(96000),
		outputContainer: new Mp3OutputFormat(),
		sampleRate: null,
	});

	expect(options).toEqual([
		{
			type: 'reencode',
			audioCodec: 'mp3',
			sampleRate: null,
		},
	]);
});

test('does not use fallback encoder params for an explicit sample rate', async () => {
	const options = await getAudioTranscodingOptions({
		inputTrack: makeAudioTrack(96000),
		outputContainer: new Mp3OutputFormat(),
		sampleRate: 96000,
	});

	expect(options).toEqual([]);
});

test('registers extension-backed audio encoders for supported containers', async () => {
	const options = await getAudioTranscodingOptions({
		inputTrack: makeAudioTrack(48000),
		outputContainer: new Mp4OutputFormat(),
		sampleRate: null,
	});
	const codecs = options.map((option) => {
		if (option.type !== 'reencode') {
			throw new Error('Expected only re-encoding options');
		}

		return option.audioCodec;
	});

	expect(codecs).toContain('mp3');
	expect(codecs).toContain('aac');
	expect(codecs).toContain('flac');
	expect(codecs).toContain('ac3');
	expect(codecs).toContain('eac3');
});
