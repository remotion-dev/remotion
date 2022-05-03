import execa from 'execa';
import path from 'path';
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
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getProResProfileName} from './get-prores-profile-name';
import {mergeAudioTrack} from './merge-audio-track';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {preprocessAudioTrack} from './preprocess-audio-track';
import {tmpDir} from './tmp-dir';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';

export type StitcherOptions = {
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	assetsInfo: RenderAssetInfo;
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
		imageFormat: ImageFormat;
	};
};

const getAssetsData = async (
	options: StitcherOptions
): Promise<string | null> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets: options.assetsInfo.assets,
		downloadDir: options.assetsInfo.downloadDir,
		onDownload: options.onDownload ?? (() => () => undefined),
	});

	markAllAssetsAsDownloaded();
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	const assetAudioDetails = await getAssetAudioDetails({
		assetPaths: assetPositions.map((a) => a.src),
	});

	const filters = calculateFfmpegFilters({
		assetAudioDetails,
		assetPositions,
		fps: options.fps,
	});
	if (options.verbose) {
		console.log('asset positions', assetPositions);
	}

	if (options.verbose) {
		console.log('filters', filters);
	}

	const tempPath = tmpDir('remotion-audio-mixing');

	const preprocessed = await Promise.all(
		filters.map(async ({filter, src}, index) => {
			const filterFile = path.join(tempPath, `${index}.aac`);
			await preprocessAudioTrack({
				ffmpegExecutable: options.ffmpegExecutable ?? null,
				audioFile: src,
				filter,
				onProgress: (prog) => console.log(prog),
				outName: filterFile,
			});
			return filterFile;
		})
	);

	const outName = path.join(tempPath, `audio.aac`);

	await mergeAudioTrack({
		ffmpegExecutable: options.ffmpegExecutable ?? null,
		files: preprocessed,
		onProgress: (prog) => console.log('merge', prog),
		outName,
	});

	// TODO: Clean up

	return outName;
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

	const audio = await getAssetsData(options);

	if (isAudioOnly) {
		throw new Error('audio only not implemented');
	}

	// TODO: If only audio should be output, finish now
	const ffmpegArgs = [
		['-r', String(options.fps)],
		...(options.internalOptions?.preEncodedFileLocation
			? [['-i', options.internalOptions?.preEncodedFileLocation]]
			: [
					['-f', 'image2'],
					['-s', `${options.width}x${options.height}`],
					['-start_number', String(options.assetsInfo.firstFrameIndex)],
					['-i', options.assetsInfo.imageSequenceName],
			  ]),
		...assetsToFfmpegInputs({
			asset: audio,
			isAudioOnly,
			fps: options.fps,
			frameCount: options.assetsInfo.assets.length,
		}),

		// -c:v is the same as -vcodec as -codec:video
		// and specified the video codec.
		['-c:v', encoderName],
		...(options.internalOptions?.preEncodedFileLocation
			? []
			: [
					proResProfileName ? ['-profile:v', proResProfileName] : null,
					supportsCrf ? ['-crf', String(crf)] : null,
					['-pix_fmt', pixelFormat],

					// Without explicitly disabling auto-alt-ref,
					// transparent WebM generation doesn't work
					pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
					['-b:v', '1M'],
			  ]),
		audioCodecName ? ['-c:a', audioCodecName] : null,
		// Ignore metadata that may come from remote media
		['-map_metadata', '-1'],
		options.force ? '-y' : null,
		options.outputLocation,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];

	const task = execa(options.ffmpegExecutable ?? 'ffmpeg', ffmpegString, {
		cwd: options.dir,
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
	return {task, getLogs: () => ffmpegOutput};
};

export const stitchFramesToVideo = async (
	options: StitcherOptions
): Promise<void> => {
	const {task, getLogs} = await spawnFfmpeg(options);
	try {
		await task;
	} catch (err) {
		throw new Error(getLogs());
	}
};
