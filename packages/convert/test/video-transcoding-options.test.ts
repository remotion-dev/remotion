import {expect, test} from 'bun:test';
import type {InputTrack} from 'mediabunny';
import {Mp4OutputFormat} from 'mediabunny';
import {getSupportedConfigs} from '../app/components/get-supported-configs';
import {prioritizeInputVideoCodec} from '../app/lib/can-transcode-or-copy';

const makeVideoTrack = (codec = 'avc') =>
	({
		id: 0,
		codec,
		getCodec: () => Promise.resolve(codec),
		rotation: 0,
		displayHeight: 1080,
		displayWidth: 1920,
		canDecode: () => Promise.resolve(true),
		isVideoTrack: () => true,
		isAudioTrack: () => false,
	}) as unknown as InputTrack;

test('offers video copy when no video edit is enabled', async () => {
	const configs = await getSupportedConfigs({
		tracks: [makeVideoTrack()],
		container: new Mp4OutputFormat(),
		action: {type: 'generic-convert'},
		userRotation: 0,
		resizeOperation: null,
		sampleRate: null,
		disableVideoCopy: false,
	});

	expect(configs.videoTrackOptions[0].operations).toContainEqual({
		type: 'copy',
	});
});

test('disables video copy when a video edit is enabled', async () => {
	const configs = await getSupportedConfigs({
		tracks: [makeVideoTrack()],
		container: new Mp4OutputFormat(),
		action: {type: 'generic-trim'},
		userRotation: 0,
		resizeOperation: null,
		sampleRate: null,
		disableVideoCopy: true,
	});

	expect(
		configs.videoTrackOptions[0].operations.some((operation) => {
			return operation.type === 'copy';
		}),
	).toBe(false);
});

test('prefers the input video codec when it is supported', () => {
	expect(
		prioritizeInputVideoCodec({
			inputVideoCodec: 'vp8',
			supportedCodecs: ['vp9', 'av1', 'vp8'],
		}),
	).toEqual(['vp8', 'vp9', 'av1']);
});
