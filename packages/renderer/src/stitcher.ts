import execa from 'execa';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
	Codec,
	FfmpegExecutable,
	Internals,
	PixelFormat,
	ProResProfile,
	RenderAssetInfo,
} from 'remotion';
import {assetsToFfmpegInputs} from './assets-to-ffmpeg-inputs';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import {getAssetAudioDetails} from './assets/get-asset-audio-details';
import {calculateFfmpegFilters} from './calculate-ffmpeg-filters';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getFrameInfo} from './get-frame-number-length';
import {getProResProfileName} from './get-prores-profile-name';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {resolveAssetSrc} from './resolve-asset-src';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';

const makeAssetsDownloadTmpDir = (): Promise<string> => {
	return fs.promises.mkdtemp(path.join(os.tmpdir(), 'remotion-assets-dir'));
};

export type StitcherOptions = {
	dir: string;
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	pixelFormat?: PixelFormat;
	codec?: Codec;
	crf?: number;
	onProgress?: (progress: number) => void;
	onDownload?: (src: string) => void;
	proResProfile?: ProResProfile;
	verbose?: boolean;
	parallelEncoding?: boolean;
	preEncodedFileLocation?: string;
	webpackBundle: string | null;
	downloadDir?: string;
	ffmpegExecutable?: FfmpegExecutable;
};

const getAssetsData = async (options: StitcherOptions) => {
	const codec = options.codec ?? Internals.DEFAULT_CODEC;
	const encoderName = getCodecName(codec);
	const isAudioOnly = encoderName === null;
	const [frameInfo, fileUrlAssets] = await Promise.all([
		options.preEncodedFileLocation
			? undefined
			: getFrameInfo({
					dir: options.dir,
					isAudioOnly,
			  }),
		convertAssetsToFileUrls({
			assets: options.assetsInfo.assets,
			downloadDir: options.downloadDir ?? (await makeAssetsDownloadTmpDir()),
			webpackBundle: options.webpackBundle,
			onDownload: options.onDownload ?? (() => undefined),
		}),
	]);

	markAllAssetsAsDownloaded();
	const assetPositions = calculateAssetPositions(fileUrlAssets);

	const assetPaths = assetPositions.map((asset) => resolveAssetSrc(asset.src));

	const assetAudioDetails = await getAssetAudioDetails({
		assetPaths,
	});

	const filters = calculateFfmpegFilters({
		assetAudioDetails,
		assetPositions,
		fps: options.fps,
		videoTrackCount: isAudioOnly ? 0 : 1,
	});
	if (options.verbose) {
		console.log('asset positions', assetPositions);
	}

	if (options.verbose) {
		console.log('filters', filters);
	}

	const {complexFilterFlag, cleanup} = await createFfmpegComplexFilter(filters);

	return {
		complexFilterFlag,
		cleanup,
		frameInfo,
		assetPaths,
	};
};

export const spawnFfmpeg = async (options: StitcherOptions) => {
	Internals.validateDimension(
		options.height,
		'height',
		'passed to `stitchFramesToVideo()`'
	);
	Internals.validateDimension(
		options.width,
		'width',
		'passed to `stitchFramesToVideo()`'
	);
	Internals.validateFps(options.fps, 'passed to `stitchFramesToVideo()`');
	const codec = options.codec ?? Internals.DEFAULT_CODEC;
	validateEvenDimensionsWithCodec({
		width: options.width,
		height: options.height,
		codec,
	});
	const crf = options.crf ?? Internals.getDefaultCrfForCodec(codec);
	const pixelFormat = options.pixelFormat ?? Internals.DEFAULT_PIXEL_FORMAT;
	await validateFfmpeg(options.ffmpegExecutable ?? null);

	const encoderName = getCodecName(codec);
	const audioCodecName = getAudioCodecName(codec);
	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	const isAudioOnly = encoderName === null;
	const supportsCrf = encoderName && codec !== 'prores';

	if (options.verbose) {
		console.log(
			'[verbose] ffmpeg',
			options.ffmpegExecutable ?? 'ffmpeg in PATH'
		);
		console.log('[verbose] encoder', encoderName);
		console.log('[verbose] audioCodec', audioCodecName);
		console.log('[verbose] pixelFormat', pixelFormat);
		if (supportsCrf) {
			console.log('[verbose] crf', crf);
		}

		console.log('[verbose] codec', codec);
		console.log('[verbose] isAudioOnly', isAudioOnly);
		console.log('[verbose] proResProfileName', proResProfileName);
	}

	Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const {
		complexFilterFlag = undefined,
		cleanup = undefined,
		frameInfo = undefined,
		assetPaths = undefined,
	} = options.parallelEncoding ? {} : await getAssetsData(options);

	const ffmpegArgs = [
		['-r', String(options.fps)],
		...(options.preEncodedFileLocation
			? [['-i', options.preEncodedFileLocation]]
			: [
					isAudioOnly
						? null
						: ['-f', options.parallelEncoding ? 'image2pipe' : 'image2'],
					isAudioOnly ? null : ['-s', `${options.width}x${options.height}`],
					frameInfo ? ['-start_number', String(frameInfo.startNumber)] : null,
					frameInfo ? ['-i', options.assetsInfo.imageSequenceName] : null,
					options.parallelEncoding ? ['-i', '-'] : null,
			  ]),
		...(assetPaths
			? assetsToFfmpegInputs({
					assets: assetPaths,
					isAudioOnly,
					fps: options.fps,
					frameCount: options.assetsInfo.assets.length,
			  })
			: []),
		options.preEncodedFileLocation
			? ['-c:v', 'copy']
			: encoderName
			? // -c:v is the same as -vcodec as -codec:video
			  // and specified the video codec.
			  ['-c:v', encoderName]
			: // If only exporting audio, we drop the video explicitly
			  ['-vn'],
		...(options.preEncodedFileLocation
			? []
			: [
					proResProfileName ? ['-profile:v', proResProfileName] : null,
					supportsCrf ? ['-crf', String(crf)] : null,
					isAudioOnly ? null : ['-pix_fmt', pixelFormat],

					// Without explicitly disabling auto-alt-ref,
					// transparent WebM generation doesn't work
					pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
					isAudioOnly ? null : ['-b:v', '1M'],
			  ]),
		audioCodecName ? ['-c:a', audioCodecName] : null,
		complexFilterFlag,
		// Ignore audio from image sequence
		isAudioOnly ? null : ['-map', '0:v'],
		// Ignore metadata that may come from remote media
		isAudioOnly ? null : ['-map_metadata', '-1'],
		options.force ? '-y' : null,
		options.outputLocation,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs
		.reduce<(string | null | undefined)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = execa(options.ffmpegExecutable ?? 'ffmpeg', ffmpegString, {
		cwd: options.dir,
	});
	task.stderr?.on('data', (data: Buffer) => {
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(data.toString());
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});
	return {task, cleanup};
};

export const stitchFramesToVideo = async (
	options: StitcherOptions
): Promise<void> => {
	const {task, cleanup} = await spawnFfmpeg(options);
	await task;
	cleanup?.();
};
