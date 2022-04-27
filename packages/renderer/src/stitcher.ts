import execa from 'execa';
import {
	Codec,
	FfmpegExecutable,
	ImageFormat,
	Internals,
	PixelFormat,
	ProResProfile,
	RenderAssetInfo,
} from 'remotion';
import {assetsToFfmpegInputs} from './assets-to-ffmpeg-inputs';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import {
	markAllAssetsAsDownloaded,
	RenderMediaOnDownload,
} from './assets/download-and-map-assets-to-file';
import {getAssetAudioDetails} from './assets/get-asset-audio-details';
import {Assets} from './assets/types';
import {calculateFfmpegFilters} from './calculate-ffmpeg-filters';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getProResProfileName} from './get-prores-profile-name';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';

export type StitcherOptions = {
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	assetsInfo: RenderAssetInfo | null;
	pixelFormat?: PixelFormat;
	codec?: Codec;
	crf?: number | null;
	onProgress?: (progress: number) => void;
	onDownload?: RenderMediaOnDownload;
	proResProfile?: ProResProfile;
	verbose?: boolean;
	ffmpegExecutable?: FfmpegExecutable;
	dir?: string;
	internalOptions?: {
		preEncodedFileLocation: string | null;
		parallelEncoding: boolean;
		imageFormat: ImageFormat;
	};
};

const getAssetsData = async (options: StitcherOptions) => {
	const codec = options.codec ?? Internals.DEFAULT_CODEC;
	const encoderName = getCodecName(codec);
	const isAudioOnly = encoderName === null;
	const fileUrlAssets = await (options.assetsInfo
		? convertAssetsToFileUrls({
				assets: options.assetsInfo.assets,
				downloadDir: options.assetsInfo.downloadDir,
				onDownload: options.onDownload ?? (() => () => undefined),
		  })
		: null);

	markAllAssetsAsDownloaded();
	const assetPositions: Assets =
		fileUrlAssets === null ? [] : calculateAssetPositions(fileUrlAssets);

	markAllAssetsAsDownloaded();

	const assetAudioDetails = await getAssetAudioDetails({
		assetPaths: assetPositions.map((a) => a.src),
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
		assetPositions,
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
		scale: 1,
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
		assetPositions = undefined,
	} = options.internalOptions?.parallelEncoding
		? {}
		: await getAssetsData(options);

	const ffmpegArgs = [
		['-r', String(options.fps)],
		...(options.internalOptions?.preEncodedFileLocation
			? [['-i', options.internalOptions?.preEncodedFileLocation]]
			: isAudioOnly
			? []
			: [
					[
						'-f',
						options.internalOptions?.parallelEncoding
							? ['image2pipe']
							: 'image2',
					],
					['-s', `${options.width}x${options.height}`],
					options.assetsInfo
						? ['-start_number', String(options.assetsInfo.firstFrameIndex)]
						: null,
					options.assetsInfo
						? ['-i', options.assetsInfo.imageSequenceName]
						: null,
					// If scale is very small (like 0.1), FFMPEG cannot figure out the image
					// format on it's own and we need to hint the format
					options.internalOptions?.parallelEncoding
						? [
								'-vcodec',
								options.internalOptions.imageFormat === 'jpeg'
									? 'mjpeg'
									: 'png',
						  ]
						: null,
					options.internalOptions?.parallelEncoding ? ['-i', '-'] : null,
			  ]),
		...(options.assetsInfo && assetPositions
			? assetsToFfmpegInputs({
					assets: assetPositions.map((a) => a.src),
					isAudioOnly,
					fps: options.fps,
					frameCount: options.assetsInfo.assets.length,
			  })
			: []),
		encoderName
			? // -c:v is the same as -vcodec as -codec:video
			  // and specified the video codec.
			  ['-c:v', encoderName]
			: // If only exporting audio, we drop the video explicitly
			  ['-vn'],
		...(options.internalOptions?.preEncodedFileLocation
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
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		// Stereo sound, even force mono to be stereo
		// Otherwise mixing mono + stereo ends up speeding up the audio
		'-ac',
		'2',
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

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];

	const task = execa(options.ffmpegExecutable ?? 'ffmpeg', ffmpegString, {
		cwd: options.internalOptions?.parallelEncoding ? undefined : options.dir,
	});
	let ffmpegOutput = '';
	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegOutput += str;
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(str);
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});
	return {task, cleanup, getLogs: () => ffmpegOutput};
};

export const stitchFramesToVideo = async (
	options: StitcherOptions
): Promise<void> => {
	const {task, cleanup, getLogs} = await spawnFfmpeg(options);
	try {
		await task;
	} catch (err) {
		throw new Error(getLogs());
	} finally {
		cleanup?.();
	}
};
