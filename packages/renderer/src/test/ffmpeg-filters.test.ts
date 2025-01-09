import {expect, test} from 'bun:test';
import {flattenVolumeArray} from '../assets/flatten-volume-array';
import type {MediaAsset} from '../assets/types';
import {getExtraFramesToCapture} from '../get-extra-frames-to-capture';
import {stringifyFfmpegFilter} from '../stringify-ffmpeg-filter';

const src =
	'/var/folders/hl/p8pg9kw15dbg3l7dbpn0scc80000gn/T/react-motion-graphicsh871Pk/1fe4a495500e1658167982183be07231.mp4';

const baseAsset: MediaAsset = {
	type: 'video',
	src,
	duration: 20,
	startInVideo: 0,
	trimLeft: 0,
	volume: 1,
	id: '1',
	playbackRate: 1,
	allowAmplificationDuringRender: false,
	toneFrequency: null,
	audioStartFrame: 0,
};

const expandAsset = ({
	base,
	extraFramesToCaptureAssets,
}: {
	base: MediaAsset;
	extraFramesToCaptureAssets: number[];
}): MediaAsset => {
	return {
		...base,
		duration: base.duration + extraFramesToCaptureAssets.length,
	};
};

test('Should create a basic filter correctly', () => {
	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: {
				...baseAsset,
				duration: 200,
			},
			channels: 1,
			assetDuration: 10,
			chunkLengthInSeconds: 3.3333,
			trimLeftOffset: 0,
			trimRightOffset: 0,
			forSeamlessAacConcatenation: false,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0us:6666666.666666667us[a0]',
		pad_end: null,
		pad_start: null,
	});
});
test('Trim the end', () => {
	const {
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: true,
		fps: 30,
		realFrameRange: [0, 99],
	});

	expect(chunkLengthInSeconds).toEqual(3.3706666666666667);
	expect(trimLeftOffset).toEqual(0);
	expect(trimRightOffset).toEqual(-0.02933333333333318);

	const padding = Math.round((chunkLengthInSeconds - 0.704) * 48000);

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: expandAsset({
				extraFramesToCaptureAssets: [
					...extraFramesToCaptureAssetsFrontend,
					...extraFramesToCaptureAssetsBackend,
				],
				base: baseAsset,
			}),
			channels: 1,
			assetDuration: 100,
			chunkLengthInSeconds,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: true,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0us:704000.0000000001us[a0]',
		pad_end: 'apad=pad_len=' + padding,
		pad_start: null,
	});
});

test('Should handle trim correctly', () => {
	const {
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: true,
		fps: 30,
		realFrameRange: [0, 99],
	});

	expect(chunkLengthInSeconds).toEqual(3.3706666666666667);
	expect(trimRightOffset).toEqual(-0.02933333333333318);

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: expandAsset({
				base: {
					...baseAsset,
					trimLeft: 10,
				},
				extraFramesToCaptureAssets: [
					...extraFramesToCaptureAssetsFrontend,
					...extraFramesToCaptureAssetsBackend,
				],
			}),
			channels: 1,
			assetDuration: 10,
			chunkLengthInSeconds,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: true,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0.3333333333333333,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=333333.3333333333us:1037333.3333333335us[a0]',
		pad_end: 'apad=pad_len=128000',
		pad_start: null,
	});
});

test('Should add padding if audio is too short', () => {
	const {trimLeftOffset, trimRightOffset} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: false,
		fps: 30,
		realFrameRange: [0, 99],
	});

	const padding = Math.round((3.3333 - 2 / 3) * 48000);

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: {
				...baseAsset,
				trimLeft: 10,
			},
			channels: 1,
			assetDuration: 1,
			chunkLengthInSeconds: 3.3333,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: false,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0.3333333333333333,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=333333.3333333333us:1000000us[a0]',
		pad_end: `apad=pad_len=${padding}`,
		pad_start: null,
	});
});

test('Should handle delay correctly', () => {
	const {
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: true,
		fps: 30,
		realFrameRange: [0, 99],
	});

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: expandAsset({
				base: {
					...baseAsset,
					trimLeft: 10,
					startInVideo: 80,
				},
				extraFramesToCaptureAssets: [
					...extraFramesToCaptureAssetsFrontend,
					...extraFramesToCaptureAssetsBackend,
				],
			}),
			channels: 1,
			assetDuration: 1,
			chunkLengthInSeconds,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: true,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0.3333333333333333,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=333333.3333333333us:1000000us[a0]',
		pad_end: 'apad=pad_len=1792',
		pad_start: 'adelay=2667|2667',
	});
});

test('Should offset multiple channels', () => {
	const {
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: true,
		fps: 30,
		realFrameRange: [0, 99],
	});

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: expandAsset({
				base: {
					...baseAsset,
					trimLeft: 10,
					startInVideo: 80,
				},
				extraFramesToCaptureAssets: [
					...extraFramesToCaptureAssetsFrontend,
					...extraFramesToCaptureAssetsBackend,
				],
			}),
			channels: 3,
			assetDuration: 1,
			chunkLengthInSeconds,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: true,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0.3333333333333333,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=333333.3333333333us:1000000us[a0]',
		pad_end: 'apad=pad_len=1792',
		pad_start: 'adelay=2667|2667|2667|2667',
	});
});

test('Should calculate pad correctly with a lot of playbackRate', () => {
	const naturalDurationInSeconds = 1000 / 30 / 16;
	const expectedPadLength =
		(2000 / 30) * 48000 - naturalDurationInSeconds * 48000;

	const {
		chunkLengthInSeconds,
		trimLeftOffset,
		trimRightOffset,
		extraFramesToCaptureAssetsBackend,
		extraFramesToCaptureAssetsFrontend,
	} = getExtraFramesToCapture({
		compositionStart: 0,
		forSeamlessAacConcatenation: false,
		fps: 30,
		realFrameRange: [0, 1999],
	});

	expect(
		stringifyFfmpegFilter({
			fps: 30,
			asset: expandAsset({
				base: {
					type: 'video',
					src,
					duration: 1000,
					volume: 1,
					id: '1',
					trimLeft: 0,
					startInVideo: 0,
					playbackRate: 16,
					allowAmplificationDuringRender: false,
					toneFrequency: null,
					audioStartFrame: 0,
				},
				extraFramesToCaptureAssets: [
					...extraFramesToCaptureAssetsFrontend,
					...extraFramesToCaptureAssetsBackend,
				],
			}),
			channels: 1,
			assetDuration: 33.333333,
			chunkLengthInSeconds,
			trimLeftOffset,
			trimRightOffset,
			forSeamlessAacConcatenation: false,
			volume: flattenVolumeArray(baseAsset.volume),
			indent: false,
			logLevel: 'info',
			presentationTimeOffsetInSeconds: 0,
		}),
	).toEqual({
		actualTrimLeft: 0,
		filter:
			'[0:a]aformat=sample_fmts=s32:sample_rates=48000,atrim=0us:33333333.000000004us,atempo=2.00000,atempo=2.00000,atempo=2.00000,atempo=2.00000[a0]',
		pad_end: `apad=pad_len=${expectedPadLength}`,
		pad_start: null,
	});
});
