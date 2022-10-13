import execa from 'execa';
import fs from 'fs';
import {readFile} from 'fs/promises';
import path from 'path';
import type {TAsset} from 'remotion';
import {Internals} from 'remotion';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import type {DownloadMap, RenderAssetInfo} from './assets/download-map';
import type {Assets} from './assets/types';
import type {Codec} from './codec';
import {DEFAULT_CODEC} from './codec';
import {codecSupportsCrf, codecSupportsMedia} from './codec-supports-media';
import {convertNumberOfGifLoopsToFfmpegSyntax} from './convert-number-of-gif-loops-to-ffmpeg';
import {
	getDefaultCrfForCodec,
	validateSelectedCrfAndCodecCombination,
} from './crf';
import {deleteDirectory} from './delete-directory';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableFfmpeg} from './ffmpeg-flags';
import type {FfmpegOverrideFn} from './ffmpeg-override';
import {findRemotionRoot} from './find-closest-package-json';
import {getAudioCodecName} from './get-audio-codec-name';
import {getCodecName} from './get-codec-name';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getProResProfileName} from './get-prores-profile-name';
import type {ImageFormat} from './image-format';
import type {CancelSignal} from './make-cancel-signal';
import {mergeAudioTrack} from './merge-audio-track';
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
	outputLocation?: string | null;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	pixelFormat?: PixelFormat;
	numberOfGifLoops?: number | null;
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
	muted?: boolean;
	enforceAudioTrack?: boolean;
	ffmpegOverride?: FfmpegOverrideFn;
};

type ReturnType = {
	task: Promise<Buffer | null>;
	getLogs: () => string;
};

const getAssetsData = async ({
	assets,
	onDownload,
	fps,
	expectedFrames,
	verbose,
	ffmpegExecutable,
	ffprobeExecutable,
	onProgress,
	downloadMap,
	remotionRoot,
}: {
	assets: TAsset[][];
	onDownload: RenderMediaOnDownload | undefined;
	fps: number;
	expectedFrames: number;
	verbose: boolean;
	ffmpegExecutable: FfmpegExecutable | null;
	ffprobeExecutable: FfmpegExecutable | null;
	onProgress: (progress: number) => void;
	downloadMap: DownloadMap;
	remotionRoot: string;
}): Promise<string> => {
	const fileUrlAssets = await convertAssetsToFileUrls({
		assets,
		onDownload: onDownload ?? (() => () => undefined),
		downloadMap,
	});

	markAllAssetsAsDownloaded(downloadMap);
	const assetPositions: Assets = calculateAssetPositions(fileUrlAssets);

	if (verbose) {
		console.log('asset positions', assetPositions);
	}

	const preprocessProgress = new Array(assetPositions.length).fill(0);

	const updateProgress = () => {
		onProgress(
			preprocessProgress.reduce((a, b) => a + b, 0) / assetPositions.length
		);
	};

	const preprocessed = (
		await Promise.all(
			assetPositions.map(async (asset, index) => {
				const filterFile = path.join(downloadMap.audioMixing, `${index}.wav`);
				const result = await preprocessAudioTrack({
					ffmpegExecutable: ffmpegExecutable ?? null,
					ffprobeExecutable: ffprobeExecutable ?? null,
					outName: filterFile,
					asset,
					expectedFrames,
					fps,
					downloadMap,
					remotionRoot,
				});
				preprocessProgress[index] = 1;
				updateProgress();
				return result;
			})
		)
	).filter(truthy);

	const outName = path.join(downloadMap.audioPreprocessing, `audio.wav`);

	await mergeAudioTrack({
		ffmpegExecutable: ffmpegExecutable ?? null,
		files: preprocessed,
		outName,
		numberOfSeconds: Number((expectedFrames / fps).toFixed(3)),
		downloadMap,
		remotionRoot,
	});

	deleteDirectory(downloadMap.audioMixing);

	onProgress(1);

	preprocessed.forEach((p) => {
		deleteDirectory(p);
	});

	return outName;
};

export const spawnFfmpeg = async (
	options: StitcherOptions,
	remotionRoot: string
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
	const codec = options.codec ?? DEFAULT_CODEC;
	validateEvenDimensionsWithCodec({
		width: options.width,
		height: options.height,
		codec,
		scale: 1,
	});
	validateSelectedCodecAndProResCombination({
		codec,
		proResProfile: options.proResProfile,
	});

	Internals.validateFps(options.fps, 'in `stitchFramesToVideo()`', false);
	const crf = options.crf ?? getDefaultCrfForCodec(codec);
	const pixelFormat = options.pixelFormat ?? DEFAULT_PIXEL_FORMAT;
	await validateFfmpeg(options.ffmpegExecutable ?? null, remotionRoot);

	const encoderName = getCodecName(codec);
	const audioCodecName = getAudioCodecName(codec);
	const proResProfileName = getProResProfileName(codec, options.proResProfile);

	const mediaSupport = codecSupportsMedia(codec);

	const supportsCrf = codecSupportsCrf(codec);

	const tempFile = options.outputLocation
		? null
		: path.join(
				options.assetsInfo.downloadMap.stitchFrames,
				`out.${getFileExtensionFromCodec(codec, 'final')}`
		  );

	const shouldRenderAudio =
		mediaSupport.audio &&
		(options.assetsInfo.assets.flat(1).length > 0 ||
			options.enforceAudioTrack) &&
		!options.muted;
	const shouldRenderVideo = mediaSupport.video;

	if (!shouldRenderAudio && !shouldRenderVideo) {
		throw new Error(
			'The output format has neither audio nor video. This can happen if you are rendering an audio codec and the output file has no audio or the muted flag was passed.'
		);
	}

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

		if (options.ffmpegOverride) {
			console.log('[verbose] ffmpegOverride', options.ffmpegOverride);
		}

		console.log('[verbose] codec', codec);
		console.log('[verbose] shouldRenderAudio', shouldRenderAudio);
		console.log('[verbose] shouldRenderVideo', shouldRenderVideo);
		console.log('[verbose] proResProfileName', proResProfileName);
	}

	validateSelectedCrfAndCodecCombination(crf, codec);
	validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const expectedFrames = options.assetsInfo.assets.length;

	const updateProgress = (preStitchProgress: number, muxProgress: number) => {
		const totalFrameProgress =
			0.5 * preStitchProgress * expectedFrames + muxProgress * 0.5;
		options.onProgress?.(Math.round(totalFrameProgress));
	};

	const audio = shouldRenderAudio
		? await getAssetsData({
				assets: options.assetsInfo.assets,
				onDownload: options.onDownload,
				fps: options.fps,
				expectedFrames,
				verbose: options.verbose ?? false,
				ffmpegExecutable: options.ffmpegExecutable ?? null,
				ffprobeExecutable: options.ffprobeExecutable ?? null,
				onProgress: (prog) => updateProgress(prog, 0),
				downloadMap: options.assetsInfo.downloadMap,
				remotionRoot,
		  })
		: null;

	if (mediaSupport.audio && !mediaSupport.video) {
		if (!audioCodecName) {
			throw new TypeError(
				'exporting audio but has no audio codec name. Report this in the Remotion repo.'
			);
		}

		const ffmpegTask = execa(
			await getExecutableFfmpeg(options.ffmpegExecutable ?? null, remotionRoot),
			[
				'-i',
				audio,
				'-c:a',
				audioCodecName,
				// Set bitrate up to 320k, for aac it might effectively be lower
				'-b:a',
				'320k',
				options.force ? '-y' : null,
				options.outputLocation ?? tempFile,
			].filter(Internals.truthy)
		);

		options.cancelSignal?.(() => {
			ffmpegTask.kill();
		});
		await ffmpegTask;
		options.onProgress?.(expectedFrames);
		if (audio) {
			await deleteDirectory(path.dirname(audio));
		}

		const file = await new Promise<Buffer | null>((resolve, reject) => {
			if (tempFile) {
				readFile(tempFile)
					.then((f) => {
						return resolve(f);
					})
					.catch((e) => reject(e));
			} else {
				resolve(null);
			}
		});
		await deleteDirectory(options.assetsInfo.downloadMap.stitchFrames);

		return {
			getLogs: () => '',
			task: Promise.resolve(file),
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
		audio ? ['-i', audio] : null,
		(options.numberOfGifLoops ?? null) === null
			? null
			: [
					'-loop',
					convertNumberOfGifLoopsToFfmpegSyntax(
						options.numberOfGifLoops ?? null
					),
			  ],
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
		options.outputLocation ?? tempFile,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs.flat(2).filter(Boolean) as string[];
	const finalFfmpegString = options.ffmpegOverride
		? options.ffmpegOverride({type: 'stitcher', args: ffmpegString})
		: ffmpegString;

	if (options.verbose && options.ffmpegOverride) {
		console.log('Generated final FFMPEG command:');
		console.log(finalFfmpegString);
	}

	const task = execa(
		await getExecutableFfmpeg(options.ffmpegExecutable ?? null, remotionRoot),
		finalFfmpegString,
		{
			cwd: options.dir,
		}
	);
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

	return {
		task: task.then(() => {
			deleteDirectory(options.assetsInfo.downloadMap.audioPreprocessing);

			if (tempFile === null) {
				deleteDirectory(options.assetsInfo.downloadMap.stitchFrames);
				return null;
			}

			return readFile(tempFile)
				.then((file) => {
					return Promise.all([
						file,
						deleteDirectory(path.dirname(tempFile)),
						deleteDirectory(options.assetsInfo.downloadMap.stitchFrames),
					]);
				})
				.then(([file]) => file);
		}),
		getLogs: () => ffmpegOutput,
	};
};

export const stitchFramesToVideo = async (
	options: StitcherOptions
): Promise<Buffer | null> => {
	const remotionRoot = findRemotionRoot();
	const {task, getLogs} = await spawnFfmpeg(options, remotionRoot);

	const happyPath = task.catch(() => {
		throw new Error(getLogs());
	});

	return Promise.race([
		happyPath,
		new Promise<Buffer | null>((_resolve, reject) => {
			options.cancelSignal?.(() => {
				reject(new Error('stitchFramesToVideo() got cancelled'));
			});
		}),
	]);
};
