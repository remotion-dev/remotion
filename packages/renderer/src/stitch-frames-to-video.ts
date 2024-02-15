import {cpSync, promises} from 'node:fs';
import path from 'node:path';
import type {TRenderAsset} from 'remotion/no-react';
import {VERSION} from 'remotion/version';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {DownloadMap, RenderAssetInfo} from './assets/download-map';
import {cleanDownloadMap} from './assets/download-map';
import type {Assets} from './assets/types';
import type {AudioCodec} from './audio-codec';
import {getDefaultAudioCodec} from './audio-codec';
import {callFfNative} from './call-ffmpeg';
import type {Codec} from './codec';
import {DEFAULT_CODEC} from './codec';
import {codecSupportsMedia} from './codec-supports-media';
import {convertNumberOfGifLoopsToFfmpegSyntax} from './convert-number-of-gif-loops-to-ffmpeg';
import {validateQualitySettings} from './crf';
import {deleteDirectory} from './delete-directory';
import {generateFfmpegArgs} from './ffmpeg-args';
import type {FfmpegOverrideFn} from './ffmpeg-override';
import {findRemotionRoot} from './find-closest-package-json';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getProResProfileName} from './get-prores-profile-name';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {cancelErrorMessages} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
import type {ColorSpace} from './options/color-space';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import type {PixelFormat} from './pixel-format';
import {
	DEFAULT_PIXEL_FORMAT,
	validateSelectedPixelFormatAndCodecCombination,
} from './pixel-format';
import {preprocessAudioTrack} from './preprocess-audio-track';
import type {ProResProfile} from './prores-profile';
import {validateSelectedCodecAndProResCombination} from './prores-profile';
import {truthy} from './truthy';
import {validateDimension, validateFps} from './validate';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateBitrate} from './validate-videobitrate';
import type {X264Preset} from './x264-preset';

type InternalStitchFramesToVideoOptions = {
	audioBitrate: string | null;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	fps: number;
	width: number;
	height: number;
	outputLocation: string | null;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	pixelFormat: PixelFormat;
	numberOfGifLoops: number | null;
	codec: Codec;
	audioCodec: AudioCodec | null;
	crf: number | null;
	onProgress?: null | ((progress: number) => void);
	onDownload: undefined | RenderMediaOnDownload;
	proResProfile: undefined | ProResProfile;
	logLevel: LogLevel;
	cancelSignal: CancelSignal | null;
	preEncodedFileLocation: string | null;
	preferLossless: boolean;
	indent: boolean;
	muted: boolean;
	x264Preset: X264Preset | null;
	enforceAudioTrack: boolean;
	ffmpegOverride: null | FfmpegOverrideFn;
	colorSpace: ColorSpace;
};

export type StitchFramesToVideoOptions = {
	audioBitrate?: string | null;
	videoBitrate?: string | null;
	encodingMaxRate?: string | null;
	encodingBufferSize?: string | null;
	fps: number;
	width: number;
	height: number;
	outputLocation?: string | null;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	pixelFormat?: PixelFormat;
	numberOfGifLoops?: number | null;
	codec?: Codec;
	audioCodec?: AudioCodec | null;
	crf?: number | null;
	onProgress?: (progress: number) => void;
	onDownload?: RenderMediaOnDownload;
	proResProfile?: ProResProfile;
	verbose?: boolean;
	cancelSignal?: CancelSignal;
	muted?: boolean;
	enforceAudioTrack?: boolean;
	ffmpegOverride?: FfmpegOverrideFn;
	x264Preset?: X264Preset | null;
	colorSpace?: ColorSpace;
};

type ReturnType = Promise<Buffer | null>;

const getAssetsData = async ({
	assets,
	onDownload,
	fps,
	expectedFrames,
	logLevel,
	onProgress,
	downloadMap,
	remotionRoot,
	indent,
}: {
	assets: TRenderAsset[][];
	onDownload: RenderMediaOnDownload | undefined;
	fps: number;
	expectedFrames: number;
	logLevel: LogLevel;
	onProgress: (progress: number) => void;
	downloadMap: DownloadMap;
	remotionRoot: string;
	indent: boolean;
}): Promise<string> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets,
		onDownload: onDownload ?? (() => () => undefined),
		downloadMap,
		indent,
		logLevel,
	});

	markAllAssetsAsDownloaded(downloadMap);
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	Log.verbose(
		{indent, logLevel, tag: 'audio'},
		'asset positions',
		JSON.stringify(assetPositions),
	);

	const preprocessProgress = new Array(assetPositions.length).fill(0);

	const updateProgress = () => {
		onProgress(
			preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length,
		);
	};

	const preprocessed = (
		await Promise.all(
			assetPositions.map(async (asset, index) => {
				const filterFile = path.join(downloadMap.audioMixing, `${index}.wav`);
				const result = await preprocessAudioTrack({
					outName: filterFile,
					asset,
					expectedFrames,
					fps,
					downloadMap,
					indent,
					logLevel,
				});
				preprocessProgress[index] = 1;
				updateProgress();
				return result;
			}),
		)
	).filter(truthy);

	const outName = path.join(downloadMap.audioPreprocessing, `audio.aac`);

	await mergeAudioTrack({
		files: preprocessed,
		outName,
		numberOfSeconds: Number((expectedFrames / fps).toFixed(3)),
		downloadMap,
		remotionRoot,
		indent,
		logLevel,
		forceLossless: false,
	});

	onProgress(1);

	deleteDirectory(downloadMap.audioMixing);
	preprocessed.forEach((p) => {
		deleteDirectory(p.outName);
	});

	return outName;
};

const innerStitchFramesToVideo = async (
	{
		assetsInfo,
		audioBitrate,
		audioCodec,
		cancelSignal,
		codec,
		crf,
		enforceAudioTrack,
		ffmpegOverride,
		force,
		fps,
		height,
		indent,
		muted,
		onDownload,
		outputLocation,
		pixelFormat,
		preEncodedFileLocation,
		preferLossless,
		proResProfile,
		logLevel,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
		width,
		numberOfGifLoops,
		onProgress,
		x264Preset,
		colorSpace,
	}: InternalStitchFramesToVideoOptions,
	remotionRoot: string,
): Promise<ReturnType> => {
	validateDimension(height, 'height', 'passed to `stitchFramesToVideo()`');
	validateDimension(width, 'width', 'passed to `stitchFramesToVideo()`');
	validateEvenDimensionsWithCodec({
		width,
		height,
		codec,
		scale: 1,
		wantsImageSequence: false,
	});
	validateSelectedCodecAndProResCombination({
		codec,
		proResProfile,
	});

	validateBitrate(audioBitrate, 'audioBitrate');
	validateBitrate(videoBitrate, 'videoBitrate');
	validateBitrate(encodingMaxRate, 'encodingMaxRate');
	// encodingBufferSize is not a bitrate but need to be validated using the same format
	validateBitrate(encodingBufferSize, 'encodingBufferSize');
	validateFps(fps, 'in `stitchFramesToVideo()`', false);
	assetsInfo.downloadMap.preventCleanup();

	const proResProfileName = getProResProfileName(codec, proResProfile);

	const mediaSupport = codecSupportsMedia(codec);

	const shouldRenderAudio =
		mediaSupport.audio &&
		(assetsInfo.assets.flat(1).length > 0 || enforceAudioTrack) &&
		!muted;

	const shouldRenderVideo = mediaSupport.video;

	if (!shouldRenderAudio && !shouldRenderVideo) {
		throw new Error(
			'The output format has neither audio nor video. This can happen if you are rendering an audio codec and the output file has no audio or the muted flag was passed.',
		);
	}

	// Explanation: https://github.com/remotion-dev/remotion/issues/1647
	const resolvedAudioCodec = preferLossless
		? getDefaultAudioCodec({codec, preferLossless: true})
		: audioCodec ?? getDefaultAudioCodec({codec, preferLossless: false});

	const tempFile = outputLocation
		? null
		: path.join(
				assetsInfo.downloadMap.stitchFrames,
				`out.${getFileExtensionFromCodec(codec, resolvedAudioCodec)}`,
			);

	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'audioCodec',
		resolvedAudioCodec,
	);
	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'pixelFormat',
		pixelFormat,
	);
	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'codec',
		codec,
	);
	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'shouldRenderAudio',
		shouldRenderAudio,
	);
	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'shouldRenderVideo',
		shouldRenderVideo,
	);

	validateQualitySettings({
		crf,
		codec,
		videoBitrate,
		encodingMaxRate,
		encodingBufferSize,
	});
	validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const expectedFrames = assetsInfo.assets.length;

	const updateProgress = (muxProgress: number) => {
		onProgress?.(muxProgress);
	};

	const audio = shouldRenderAudio
		? await getAssetsData({
				assets: assetsInfo.assets,
				onDownload,
				fps,
				expectedFrames,
				logLevel,
				onProgress: () => updateProgress(0),
				downloadMap: assetsInfo.downloadMap,
				remotionRoot,
				indent,
			})
		: null;

	if (mediaSupport.audio && !mediaSupport.video) {
		if (!resolvedAudioCodec) {
			throw new TypeError(
				'exporting audio but has no audio codec name. Report this in the Remotion repo.',
			);
		}

		cpSync(audio as string, outputLocation ?? (tempFile as string));
		onProgress?.(expectedFrames);
		if (audio) {
			deleteDirectory(path.dirname(audio));
		}

		const file = await new Promise<Buffer | null>((resolve, reject) => {
			if (tempFile) {
				promises
					.readFile(tempFile)
					.then((f) => {
						return resolve(f);
					})
					.catch((e) => reject(e));
			} else {
				resolve(null);
			}
		});
		deleteDirectory(assetsInfo.downloadMap.stitchFrames);

		return Promise.resolve(file);
	}

	const ffmpegArgs = [
		...(preEncodedFileLocation
			? [['-i', preEncodedFileLocation]]
			: [
					['-r', String(fps)],
					['-f', 'image2'],
					['-s', `${width}x${height}`],
					['-start_number', String(assetsInfo.firstFrameIndex)],
					['-i', assetsInfo.imageSequenceName],
					codec === 'gif'
						? ['-filter_complex', 'split[v],palettegen,[v]paletteuse']
						: null,
				]),
		audio ? ['-i', audio] : null,
		numberOfGifLoops === null
			? null
			: ['-loop', convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops)],
		...generateFfmpegArgs({
			codec,
			crf,
			videoBitrate,
			encodingMaxRate,
			encodingBufferSize,
			hasPreencoded: Boolean(preEncodedFileLocation),
			proResProfileName,
			pixelFormat,
			x264Preset,
			colorSpace,
		}),
		codec === 'h264' ? ['-movflags', 'faststart'] : null,
		resolvedAudioCodec ? ['-c:a', 'copy'] : null,
		// Ignore metadata that may come from remote media
		['-map_metadata', '-1'],
		['-metadata', `comment=Made with Remotion ${VERSION}`],
		force ? '-y' : null,
		outputLocation ?? tempFile,
	];

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];
	const finalFfmpegString = ffmpegOverride
		? ffmpegOverride({type: 'stitcher', args: ffmpegString})
		: ffmpegString;

	Log.verbose(
		{
			indent: indent ?? false,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		'Generated final FFMPEG command:',
	);
	Log.verbose(
		{
			indent,
			logLevel,
			tag: 'stitchFramesToVideo()',
		},
		finalFfmpegString.join(' '),
	);

	const task = callFfNative({
		bin: 'ffmpeg',
		args: finalFfmpegString,
		indent,
		logLevel,
	});
	cancelSignal?.(() => {
		task.kill();
	});
	let ffmpegStderr = '';
	let isFinished = false;

	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegStderr += str;
		if (onProgress) {
			const parsed = parseFfmpegProgress(str, fps);
			// FFMPEG bug: In some cases, FFMPEG does hang after it is finished with it's job
			// Example repo: https://github.com/JonnyBurger/ffmpeg-repro (access can be given upon request)
			if (parsed !== undefined) {
				// If two times in a row the finishing frame is logged, we quit the render
				if (parsed === expectedFrames) {
					if (isFinished) {
						task.stdin?.write('q');
					} else {
						isFinished = true;
					}
				}

				updateProgress(parsed);
			}
		}
	});

	return new Promise<Buffer | null>((resolve, reject) => {
		task.once('close', (code, signal) => {
			if (code === 0) {
				assetsInfo.downloadMap.allowCleanup();

				if (tempFile === null) {
					cleanDownloadMap(assetsInfo.downloadMap);
					return resolve(null);
				}

				promises
					.readFile(tempFile)
					.then((f) => {
						resolve(f);
					})
					.catch((e) => {
						reject(e);
					})
					.finally(() => {
						cleanDownloadMap(assetsInfo.downloadMap);
					});
			} else {
				reject(
					new Error(
						`FFmpeg quit with code ${code} ${
							signal ? `(${signal})` : ''
						} The FFmpeg output was ${ffmpegStderr}`,
					),
				);
			}
		});
	});
};

export const internalStitchFramesToVideo = async (
	options: InternalStitchFramesToVideoOptions,
): Promise<Buffer | null> => {
	const remotionRoot = findRemotionRoot();
	const task = await innerStitchFramesToVideo(options, remotionRoot);

	return Promise.race([
		task,
		new Promise<Buffer | null>((_resolve, reject) => {
			options.cancelSignal?.(() => {
				reject(new Error(cancelErrorMessages.stitchFramesToVideo));
			});
		}),
	]);
};

/**
 * @description Takes a series of images and audio information generated by renderFrames() and encodes it to a video.
 * @see [Documentation](https://www.remotion.dev/docs/renderer/stitch-frames-to-video)
 */
export const stitchFramesToVideo = ({
	assetsInfo,
	force,
	fps,
	height,
	width,
	audioBitrate,
	audioCodec,
	cancelSignal,
	codec,
	crf,
	enforceAudioTrack,
	ffmpegOverride,
	muted,
	numberOfGifLoops,
	onDownload,
	onProgress,
	outputLocation,
	pixelFormat,
	proResProfile,
	verbose,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	x264Preset,
	colorSpace,
}: StitchFramesToVideoOptions): Promise<Buffer | null> => {
	return internalStitchFramesToVideo({
		assetsInfo,
		audioBitrate: audioBitrate ?? null,
		encodingMaxRate: encodingMaxRate ?? null,
		encodingBufferSize: encodingBufferSize ?? null,
		audioCodec: audioCodec ?? null,
		cancelSignal: cancelSignal ?? null,
		codec: codec ?? DEFAULT_CODEC,
		crf: crf ?? null,
		enforceAudioTrack: enforceAudioTrack ?? false,
		ffmpegOverride: ffmpegOverride ?? null,
		force,
		fps,
		height,
		indent: false,
		muted: muted ?? false,
		numberOfGifLoops: numberOfGifLoops ?? null,
		onDownload: onDownload ?? undefined,
		onProgress,
		outputLocation: outputLocation ?? null,
		pixelFormat: pixelFormat ?? DEFAULT_PIXEL_FORMAT,
		proResProfile,
		logLevel: verbose ? 'verbose' : 'info',
		videoBitrate: videoBitrate ?? null,
		width,
		preEncodedFileLocation: null,
		preferLossless: false,
		x264Preset: x264Preset ?? null,
		colorSpace: colorSpace ?? 'default',
	});
};
