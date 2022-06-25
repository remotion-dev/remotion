import execa from 'execa';
import fs from 'fs';
import path from 'path';
import type {
	Codec,
	FfmpegExecutable,
	ImageFormat,
	PixelFormat,
	ProResProfile,
	RenderAssetInfo,
	TAsset,
} from 'remotion';
import {Internals} from 'remotion';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {Assets} from './assets/types';
import {deleteDirectory} from './delete-directory';
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getProResProfileName} from './get-prores-profile-name';
import type {CancelSignal} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {preprocessAudioTrack} from './preprocess-audio-track';
import {tmpDir} from './tmp-dir';
import {validateEvenDimensionsWithCodec} from './validate-even-dimensions-with-codec';
import {validateFfmpeg} from './validate-ffmpeg';

const packageJsonPath = path.join(__dirname, '..', 'package.json');

const packageJson = fs.existsSync(packageJsonPath)
	? JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
	: null;

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
	ffprobeExecutable?: FfmpegExecutable;
	dir?: string;
	cancelSignal?: CancelSignal;
	internalOptions?: {
		preEncodedFileLocation: string | null;
		imageFormat: ImageFormat;
	};
};

type ReturnType = {
	task: Promise<void>;
	getLogs: () => string;
};

const getAssetsData = async ({
	assets,
	downloadDir,
	onDownload,
	fps,
	expectedFrames,
	verbose,
	ffmpegExecutable,
	ffprobeExecutable,
	onProgress,
}: {
	assets: TAsset[][];
	downloadDir: string;
	onDownload: RenderMediaOnDownload | undefined;
	fps: number;
	expectedFrames: number;
	verbose: boolean;
	ffmpegExecutable: FfmpegExecutable | null;
	ffprobeExecutable: FfmpegExecutable | null;
	onProgress: (progress: number) => void;
}): Promise<string> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets,
		downloadDir,
		onDownload: onDownload ?? (() => () => undefined),
	});

	markAllAssetsAsDownloaded();
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	if (verbose) {
		console.log('asset positions', assetPositions);
	}

	const tempPath = tmpDir('remotion-audio-mixing');

	const preprocessProgress = new Array(assetPositions.length).fill(0);

	const updateProgress = () => {
		onProgress(
			preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length
		);
	};

	const preprocessed = (
		await Promise.all(
			assetPositions.map(async (asset, index) => {
				const filterFile = path.join(tempPath, `${index}.wav`);
				const result = await preprocessAudioTrack({
					ffmpegExecutable: ffmpegExecutable ?? null,
					ffprobeExecutable: ffprobeExecutable ?? null,
					outName: filterFile,
					asset,
					expectedFrames,
					fps,
				});
				preprocessProgress[index] = 1;
				updateProgress();
				return result;
			})
		)
	).filter(Internals.truthy);

	const outName = path.join(tempPath, `audio.wav`);

	await mergeAudioTrack({
		ffmpegExecutable: ffmpegExecutable ?? null,
		files: preprocessed,
		outName,
		numberOfSeconds: Number((expectedFrames / fps).toFixed(3)),
	});

	onProgress(1);

	preprocessed.forEach((p) => {
		deleteDirectory(p);
	});

	return outName;
};

export const spawnFfmpeg = async (
	options: StitcherOptions
): Promise<ReturnType> => {
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

	const expectedFrames = options.assetsInfo.assets.length;

	const updateProgress = (preStitchProgress: number, muxProgress: number) => {
		const totalFrameProgress =
			0.5 * preStitchProgress * expectedFrames + muxProgress * 0.5;
		options.onProgress?.(Math.round(totalFrameProgress));
	};

	const audio = await getAssetsData({
		assets: options.assetsInfo.assets,
		downloadDir: options.assetsInfo.downloadDir,
		onDownload: options.onDownload,
		fps: options.fps,
		expectedFrames,
		verbose: options.verbose ?? false,
		ffmpegExecutable: options.ffmpegExecutable ?? null,
		ffprobeExecutable: options.ffprobeExecutable ?? null,
		onProgress: (prog) => updateProgress(prog, 0),
	});

	if (isAudioOnly) {
		if (!audioCodecName) {
			throw new TypeError(
				'exporting audio but has no audio codec name. Report this in the Remotion repo.'
			);
		}

		const ffmpegTask = execa(
			'ffmpeg',
			[
				'-i',
				audio,
				'-c:a',
				audioCodecName,
				// Set bitrate up to 320k, for aac it might effectively be lower
				'-b:a',
				'320k',
				options.force ? '-y' : null,
				options.outputLocation,
			].filter(Internals.truthy)
		);
		options.cancelSignal?.(() => {
			ffmpegTask.kill();
		});
		await ffmpegTask;
		options.onProgress?.(expectedFrames);
		return {
			getLogs: () => '',
			task: Promise.resolve(),
		};
	}

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
		['-i', audio],
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
		codec === 'h264' ? ['-movflags', 'faststart'] : null,
		audioCodecName ? ['-c:a', audioCodecName] : null,
		// Set max bitrate up to 1024kbps, will choose lower if that's too much
		audioCodecName ? ['-b:a', '512K'] : null,
		// Ignore metadata that may come from remote media
		['-map_metadata', '-1'],
		[
			'-metadata',
			`comment=` +
				[`Made with Remotion`, packageJson ? packageJson.version : null].join(
					' '
				),
		],
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
	options.cancelSignal?.(() => {
		task.kill();
	});
	let ffmpegOutput = '';
	let isFinished = false;
	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		ffmpegOutput += str;
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(str);
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

				updateProgress(1, parsed);
			}
		}
	});
	return {task: task.then(() => undefined), getLogs: () => ffmpegOutput};
};

export const stitchFramesToVideo = async (
	options: StitcherOptions
): Promise<void> => {
	const {task, getLogs} = await spawnFfmpeg(options);

	const happyPath = task.catch(() => {
		throw new Error(getLogs());
	});

	return Promise.race([
		happyPath,
		new Promise<void>((_resolve, reject) => {
			options.cancelSignal?.(() => {
				reject(new Error('stitchFramesToVideo() got cancelled'));
			});
		}),
	]);
};
