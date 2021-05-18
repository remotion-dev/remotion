import execa from 'execa';
import fs from 'fs';
import {
	Codec,
	ImageFormat,
	Internals,
	PixelFormat,
	RenderAssetInfo,
} from 'remotion';
import {calculateAssetPositions} from './assets/calculate-asset-positions';
import {convertAssetsToFileUrls} from './assets/convert-assets-to-file-urls';
import {markAllAssetsAsDownloaded} from './assets/download-and-map-assets-to-file';
import {getAssetAudioDetails} from './assets/get-asset-audio-details';
import {calculateFfmpegFilters} from './calculate-ffmpeg-filters';
import {createFfmpegComplexFilter} from './create-ffmpeg-complex-filter';
import {DEFAULT_IMAGE_FORMAT} from './image-format';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {resolveAssetSrc} from './resolve-asset-src';
import {validateFfmpeg} from './validate-ffmpeg';

const getCodecName = (codec: Codec): string | null => {
	if (Internals.isAudioCodec(codec)) {
		return null;
	}

	if (codec === 'h264') {
		return 'libx264';
	}

	if (codec === 'h265') {
		return 'libx265';
	}

	if (codec === 'vp8') {
		return 'libvpx';
	}

	if (codec === 'vp9') {
		return 'libvpx-vp9';
	}

	throw new TypeError(`Cannot find FFMPEG codec for ${codec}`);
};

const getAudioCodecName = (codec: Codec): string | null => {
	if (!Internals.isAudioCodec(codec)) {
		return 'aac';
	}

	if (codec === 'aac') {
		return 'aac';
	}

	if (codec === 'mp3') {
		return 'libmp3lame';
	}

	return null;
};

// eslint-disable-next-line complexity
export const stitchFramesToVideo = async (options: {
	dir: string;
	fps: number;
	width: number;
	height: number;
	outputLocation: string;
	force: boolean;
	assetsInfo: RenderAssetInfo;
	// TODO: Let's make this parameter mandatory in the next major release
	imageFormat?: ImageFormat;
	pixelFormat?: PixelFormat;
	codec?: Codec;
	crf?: number;
	// TODO: Do we want a parallelism flag for stitcher?
	parallelism?: number | null;
	onProgress?: (progress: number) => void;
	onDownload?: (src: string) => void;
	verbose?: boolean;
}): Promise<void> => {
	const codec = options.codec ?? Internals.DEFAULT_CODEC;
	const crf = options.crf ?? Internals.getDefaultCrfForCodec(codec);
	const imageFormat = options.imageFormat ?? DEFAULT_IMAGE_FORMAT;
	const pixelFormat = options.pixelFormat ?? Internals.DEFAULT_PIXEL_FORMAT;
	await validateFfmpeg();
	const files = await fs.promises.readdir(options.dir);
	const numbers = files
		.filter((f) => f.match(/element-([0-9]+)/))
		.map((f) => {
			return f.match(/element-([0-9]+)/)?.[1] as string;
		})
		.map((f) => Number(f));
	const biggestNumber = Math.max(...numbers);
	const smallestNumber = Math.min(...numbers);
	const numberLength = String(biggestNumber).length;

	const encoderName = getCodecName(codec);
	const audioCodecName = getAudioCodecName(codec);
	const isAudioOnly = encoderName === null;

	if (options.verbose) {
		console.log('[verbose] encoder', encoderName);
		console.log('[verbose] audioCodec', audioCodecName);
		console.log('[verbose] pixelFormat', pixelFormat);
		console.log('[verbose] imageFormat', imageFormat);
		console.log('[verbose] crf', crf);
		console.log('[verbose] codec', codec);
		console.log('[verbose] isAudioOnly', isAudioOnly);
	}

	Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);

	const fileUrlAssets = await convertAssetsToFileUrls({
		assets: options.assetsInfo.assets,
		dir: options.assetsInfo.bundleDir,
		onDownload: options.onDownload ?? (() => undefined),
	});
	markAllAssetsAsDownloaded();
	const assetPositions = calculateAssetPositions(fileUrlAssets);

	const assetPaths = assetPositions.map((asset) => resolveAssetSrc(asset.src));
	if (isAudioOnly && assetPaths.length === 0) {
		throw new Error(
			`Cannot render - you are trying to generate an audio file (${codec}) but your composition doesn't contain any audio.`
		);
	}

	const assetAudioDetails = await getAssetAudioDetails({
		assetPaths,
		parallelism: options.parallelism,
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
	const ffmpegArgs = [
		['-r', String(options.fps)],
		isAudioOnly ? null : ['-f', 'image2'],
		isAudioOnly ? null : ['-s', `${options.width}x${options.height}`],
		isAudioOnly ? null : ['-start_number', String(smallestNumber)],
		isAudioOnly ? null : ['-i', `element-%0${numberLength}d.${imageFormat}`],
		...assetPaths.map((path) => ['-i', path]),
		encoderName
			? // -c:v is the same as -vcodec as -codec:video
			  // and specified the video codec.
			  ['-c:v', encoderName]
			: // If only exporting audio, we drop the video explicitly
			  ['-vn'],
		isAudioOnly ? null : ['-crf', String(crf)],
		isAudioOnly ? null : ['-pix_fmt', pixelFormat],

		// Without explicitly disabling auto-alt-ref,
		// transparent WebM generation doesn't work
		pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
		isAudioOnly ? null : ['-b:v', '1M'],
		audioCodecName ? ['-c:a', audioCodecName] : null,
		complexFilterFlag,
		// Ignore audio from image sequence
		isAudioOnly ? null : ['-map', '0:v'],
		options.force ? '-y' : null,
		options.outputLocation,
	];

	if (options.verbose) {
		console.log('Generated FFMPEG command:');
		console.log(ffmpegArgs);
	}

	const ffmpegString = ffmpegArgs
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = execa('ffmpeg', ffmpegString, {cwd: options.dir});

	task.stderr?.on('data', (data: Buffer) => {
		if (options.onProgress) {
			const parsed = parseFfmpegProgress(data.toString());
			if (parsed !== undefined) {
				options.onProgress(parsed);
			}
		}
	});
	await task;
	cleanup();
};
