import {expect, test} from 'bun:test';
import type {RenderAssetInfo} from '../assets/download-map';
import {makeDownloadMap} from '../assets/download-map';
import {getShouldRenderAudio} from '../render-has-audio';

const createMockAssetInfo = (
	hasAudioAssets: boolean = false,
): RenderAssetInfo => {
	const downloadMap = makeDownloadMap();
	return {
		assets: hasAudioAssets
			? [
					{
						frame: 0,
						audioAndVideoAssets: [
							{
								type: 'audio' as const,
								src: 'test.mp3',
								id: 'test',
								frame: 0,
								volume: 1,
								mediaFrame: 0,
								playbackRate: 1,
								toneFrequency: 1,
								audioStartFrame: 0,
								audioStreamIndex: 0,
							},
						],
						artifactAssets: [],
						inlineAudioAssets: [],
					},
				]
			: [],
		chunkLengthInSeconds: 1,
		downloadMap,
		firstFrameIndex: 0,
		forSeamlessAacConcatenation: false,
		imageSequenceName: '/tmp/test-%d.png',
		trimLeftOffset: 0,
		trimRightOffset: 0,
	};
};

test('getShouldRenderAudio - should return no when muted is true', () => {
	const assetsInfo = createMockAssetInfo();

	const result = getShouldRenderAudio({
		assetsInfo,
		codec: 'h264',
		enforceAudioTrack: false,
		muted: true,
	});

	expect(result).toBe('no');
});

test('getShouldRenderAudio - should return no when codec does not support audio', () => {
	const assetsInfo = createMockAssetInfo();

	const result = getShouldRenderAudio({
		assetsInfo,
		codec: 'gif',
		enforceAudioTrack: false,
		muted: false,
	});

	expect(result).toBe('no');
});

test('getShouldRenderAudio - should return yes when enforceAudioTrack is true', () => {
	const assetsInfo = createMockAssetInfo();

	const result = getShouldRenderAudio({
		assetsInfo,
		codec: 'h264',
		enforceAudioTrack: true,
		muted: false,
	});

	expect(result).toBe('yes');
});

test('getShouldRenderAudio - should return maybe when assetsInfo is null', () => {
	const result = getShouldRenderAudio({
		assetsInfo: null,
		codec: 'h264',
		enforceAudioTrack: false,
		muted: false,
	});

	expect(result).toBe('maybe');
});

test('getShouldRenderAudio - should return no when there are no frames', () => {
	const assetsInfo = createMockAssetInfo();

	const result = getShouldRenderAudio({
		assetsInfo,
		codec: 'h264',
		enforceAudioTrack: false,
		muted: false,
	});

	expect(result).toBe('no');
});

test('getShouldRenderAudio - should return yes when there are audio assets', () => {
	const assetsInfo = createMockAssetInfo(true);

	const result = getShouldRenderAudio({
		assetsInfo,
		codec: 'h264',
		enforceAudioTrack: false,
		muted: false,
	});

	expect(result).toBe('yes');
});
