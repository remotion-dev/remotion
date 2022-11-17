import execa from 'execa';
import type {OffthreadVideoImageFormat} from 'remotion';
import type {DownloadMap} from './assets/download-map';
import {getVideoStreamDuration} from './assets/get-video-stream-duration';
import {determineResizeParams} from './determine-resize-params';
import {determineVcodecFfmepgFlags} from './determine-vcodec-ffmepg-flags';
import {ensurePresentationTimestamps} from './ensure-presentation-timestamp';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableBinary} from './ffmpeg-flags';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';
import {ACCEPTABLE_OFFSET_THRESHOLD} from './get-can-extract-frames-fast';
import {getFrameOfVideoSlow} from './get-frame-of-video-slow';
import {getVideoInfo} from './get-video-info';
import {isBeyondLastFrame, markAsBeyondLastFrame} from './is-beyond-last-frame';
import type {LastFrameOptions} from './last-frame-from-video-cache';
import {
	getLastFrameFromCache,
	setLastFrameInCache,
} from './last-frame-from-video-cache';
import {pLimit} from './p-limit';
import {startPerfMeasure, stopPerfMeasure} from './perf';
import {truthy} from './truthy';
import {tryToExtractFrameOfVideoFast} from './try-to-extract-frame-of-video-fast';

const lastFrameLimit = pLimit(1);
const mainLimit = pLimit(5);

const getLastFrameOfVideoFastUnlimited = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const {ffmpegExecutable, ffprobeExecutable, offset, src, downloadMap} =
		options;
	const fromCache = getLastFrameFromCache({...options, offset: 0});
	if (fromCache) {
		return fromCache;
	}

	const {duration, fps} = await getVideoStreamDuration(
		downloadMap,
		src,
		ffprobeExecutable,
		options.remotionRoot
	);

	if (duration === null) {
		throw new Error(
			`Could not determine the duration of ${src} using FFMPEG. The file is not supported.`
		);
	}

	if (
		options.specialVCodecForTransparency === 'vp8' ||
		offset > ACCEPTABLE_OFFSET_THRESHOLD
	) {
		const last = await getFrameOfVideoSlow({
			duration,
			ffmpegExecutable,
			src,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
			needsResize: options.needsResize,
			offset: offset - 1000 / (fps === null ? 10 : fps),
			fps,
			remotionRoot: options.remotionRoot,
		});
		return last;
	}

	const actualOffset = `${duration * 1000 - offset}ms`;
	const [stdErr, stdoutBuffer] = await tryToExtractFrameOfVideoFast({
		actualOffset,
		ffmpegExecutable,
		imageFormat: options.imageFormat,
		needsResize: options.needsResize,
		remotionRoot: options.remotionRoot,
		specialVCodecForTransparency: options.specialVCodecForTransparency,
		src,
	});

	const isEmpty = stdErr.includes('Output file is empty');
	if (isEmpty) {
		const unlimited = await getLastFrameOfVideoFastUnlimited({
			ffmpegExecutable,
			// Decrement in 10ms increments, or 1 frame (e.g. fps = 25 --> 40ms)
			offset: offset + (fps === null ? 10 : 1000 / fps),
			src,
			ffprobeExecutable,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
			needsResize: options.needsResize,
			downloadMap: options.downloadMap,
			remotionRoot: options.remotionRoot,
		});

		return unlimited;
	}

	return stdoutBuffer;
};

export const getLastFrameOfVideo = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const result = await lastFrameLimit(
		getLastFrameOfVideoFastUnlimited,
		options
	);
	setLastFrameInCache(options, result);

	return result;
};

type Options = {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	imageFormat: OffthreadVideoImageFormat;
	downloadMap: DownloadMap;
	remotionRoot: string;
};

const extractFrameFromVideoFn = async ({
	time,
	ffmpegExecutable,
	ffprobeExecutable,
	imageFormat,
	downloadMap,
	remotionRoot,
	...options
}: Options): Promise<Buffer> => {
	// We make a new copy of the video only for video because the conversion may affect
	// audio rendering, so we work with 2 different files
	const src = await ensurePresentationTimestamps({
		downloadMap,
		src: options.src,
		remotionRoot,
		ffmpegExecutable,
		ffprobeExecutable,
	});
	const {specialVcodecForTransparency: specialVcodec, needsResize} =
		await getVideoInfo(downloadMap, src, ffprobeExecutable, remotionRoot);

	if (specialVcodec === 'vp8') {
		const {fps} = await getVideoStreamDuration(
			downloadMap,
			src,
			ffprobeExecutable,
			remotionRoot
		);
		return getFrameOfVideoSlow({
			ffmpegExecutable,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			src,
			duration: time,
			needsResize,
			offset: 0,
			fps,
			remotionRoot,
		});
	}

	if (isBeyondLastFrame(downloadMap, src, time)) {
		const lastFrame = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			needsResize,
			downloadMap,
			remotionRoot,
		});
		return lastFrame;
	}

	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout, stderr} = execa(
		await getExecutableBinary(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		[
			'-ss',
			ffmpegTimestamp,
			...determineVcodecFfmepgFlags(specialVcodec),
			'-i',
			src,
			'-frames:v',
			'1',
			'-f',
			'image2pipe',
			'-vcodec',
			imageFormat === 'jpeg' ? 'mjpeg' : 'png',
			...determineResizeParams(needsResize),
			'-',
		].filter(truthy),
		{
			buffer: false,
		}
	);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stdoutChunks: Buffer[] = [];
	const stderrChunks: Buffer[] = [];

	const stderrStringProm = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf8'))
		);
	});

	const stdoutBuffer = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => stdoutChunks.push(d));
		stdout.on('error', (err) => reject(err));
		stdout.on('end', () => resolve(Buffer.concat(stdoutChunks)));
	});

	const [stderrStr, stdOut] = await Promise.all([
		stderrStringProm,
		stdoutBuffer,
	]);

	if (stderrStr.includes('Output file is empty')) {
		markAsBeyondLastFrame(downloadMap, src, time);
		const last = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency: specialVcodec,
			needsResize,
			downloadMap,
			remotionRoot,
		});

		return last;
	}

	if (stdOut.length === 0) {
		console.log('FFMPEG Logs:');
		console.log(stderrStr);
		throw new Error(
			"Couldn't extract frame from video - FFMPEG did not return any data. Check logs to see more information"
		);
	}

	return stdOut;
};

export const extractFrameFromVideo = async (options: Options) => {
	const perf = startPerfMeasure('extract-frame');
	const res = await mainLimit(extractFrameFromVideoFn, options);
	stopPerfMeasure(perf);
	return res;
};
