import type {InputVideoTrack} from 'mediabunny';
import {expect, test} from 'vitest';
import {shouldFallbackForUntaggedSdH264} from '../should-fallback-for-untagged-sd-h264';

type Codec = Awaited<ReturnType<InputVideoTrack['getCodec']>>;

const makeTrack = ({
	codec,
	colorSpace,
	height,
	width,
}: {
	codec: Codec;
	colorSpace: VideoColorSpaceInit;
	height: number;
	width: number;
}) => {
	return {
		getCodec: () => Promise.resolve(codec),
		getColorSpace: () => Promise.resolve(colorSpace),
		getSquarePixelHeight: () => Promise.resolve(height),
		getSquarePixelWidth: () => Promise.resolve(width),
	} as unknown as InputVideoTrack;
};

test('falls back for untagged SD H.264', async () => {
	await expect(
		shouldFallbackForUntaggedSdH264(
			makeTrack({
				codec: 'avc',
				colorSpace: {},
				height: 480,
				width: 854,
			}),
		),
	).resolves.toBe(true);
});

test('does not fall back if color metadata is present', async () => {
	await expect(
		shouldFallbackForUntaggedSdH264(
			makeTrack({
				codec: 'avc',
				colorSpace: {matrix: 'bt709'},
				height: 480,
				width: 854,
			}),
		),
	).resolves.toBe(false);
});

test('does not fall back for HD H.264', async () => {
	await expect(
		shouldFallbackForUntaggedSdH264(
			makeTrack({
				codec: 'avc',
				colorSpace: {},
				height: 720,
				width: 1280,
			}),
		),
	).resolves.toBe(false);
});

test('does not fall back for non-H.264 codecs', async () => {
	await expect(
		shouldFallbackForUntaggedSdH264(
			makeTrack({
				codec: 'vp9',
				colorSpace: {},
				height: 480,
				width: 854,
			}),
		),
	).resolves.toBe(false);
});
