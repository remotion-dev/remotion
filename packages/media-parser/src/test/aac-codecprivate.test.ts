import {expect, test} from 'bun:test';
import {createAacCodecPrivate, parseAacCodecPrivate} from '../aac-codecprivate';

test('AACCodecPrivate', () => {
	const codecPrivate = createAacCodecPrivate({
		audioObjectType: 2,
		sampleRate: 48000,
		channelConfiguration: 2,
	});
	expect(codecPrivate).toEqual(new Uint8Array([17, 144]));
});

test('Parse AAC', () => {
	const parsed = parseAacCodecPrivate(new Uint8Array([17, 136]));
	expect(parsed).toEqual({
		audioObjectType: 2,
		sampleRate: 48000,
		channelConfiguration: 1,
	});
	const fixed = createAacCodecPrivate(parsed);
	expect(fixed).toEqual(new Uint8Array([17, 136]));
});

test('chrome thing', () => {
	const parsed = parseAacCodecPrivate(new Uint8Array([18, 8, 15]));
	expect(parsed).toEqual({
		audioObjectType: 2,
		sampleRate: 44100,
		channelConfiguration: 1,
	});
	const fixed = createAacCodecPrivate(parsed);
	expect(fixed).toEqual(new Uint8Array([18, 8]));
});
