import execa from 'execa';
import type {FfmpegExecutable, OffthreadVideoImageFormat} from 'remotion';
import { Internals} from 'remotion';
import {getAudioChannelsAndDuration} from './assets/get-audio-channels';
import {ensurePresentationTimestamps} from './ensure-presentation-timestamp';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';
import {isBeyondLastFrame, markAsBeyondLastFrame} from './is-beyond-last-frame';
import type {
	SpecialVCodecForTransparency} from './is-vp9-video';
import {
	getSpecialVCodecForTransparency
} from './is-vp9-video';
import type {
	LastFrameOptions} from './last-frame-from-video-cache';
import {
	getLastFrameFromCache,
	setLastFrameInCache,
} from './last-frame-from-video-cache';
import {pLimit} from './p-limit';

const lastFrameLimit = pLimit(1);
const mainLimit = pLimit(5);

export const determineVcodecFfmepgFlags = (
	vcodecFlag: SpecialVCodecForTransparency
) => {
	return [
		vcodecFlag === 'vp9' ? '-vcodec' : null,
		vcodecFlag === 'vp9' ? 'libvpx-vp9' : null,
		vcodecFlag === 'vp8' ? '-vcodec' : null,
		vcodecFlag === 'vp8' ? 'libvpx' : null,
	].filter(Internals.truthy);
};

// Uses no seeking, therefore the whole video has to be decoded. This is a last resort and should only happen
// if the video is corrupted
const getFrameOfVideoSlow = async ({
	src,
	timestamp,
	ffmpegExecutable,
	imageFormat,
	specialVCodecForTransparency,
}: {
	ffmpegExecutable: FfmpegExecutable;
	src: string;
	timestamp: number;
	imageFormat: OffthreadVideoImageFormat;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
}) => {
	console.warn(
		`\nUsing a slow method to extract the frame at ${timestamp}ms of ${src}. See https://remotion.dev/docs/slow-method-to-extract-frame for advice`
	);

	const actualOffset = `-${timestamp * 1000}ms`;
	const command = [
		'-itsoffset',
		actualOffset,
		...determineVcodecFfmepgFlags(specialVCodecForTransparency),
		'-i',
		src,
		'-frames:v',
		'1',
		'-c:v',
		imageFormat === 'jpeg' ? 'mjpeg' : 'png',
		'-f',
		'image2pipe',
		'-',
	].filter(Internals.truthy);

	const {stdout, stderr} = execa(ffmpegExecutable ?? 'ffmpeg', command);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stderrChunks: Buffer[] = [];
	const stdoutChunks: Buffer[] = [];

	const stdErrString = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf-8'))
		);
	});

	const stdoutChunk = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => stdoutChunks.push(d));
		stdout.on('error', (err) => reject(err));
		stdout.on('end', () => resolve(Buffer.concat(stdoutChunks)));
	});

	const [stdErr, stdoutBuffer] = await Promise.all([stdErrString, stdoutChunk]);

	const isEmpty = stdErr.includes('Output file is empty');
	if (isEmpty) {
		throw new Error(
			`Could not get last frame of ${src}. Tried to seek to the end using the command "ffmpeg ${command.join(
				' '
			)}" but got no frame. Most likely this video is corrupted.`
		);
	}

	return stdoutBuffer;
};

const getLastFrameOfVideoFastUnlimited = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const {ffmpegExecutable, ffprobeExecutable, offset, src} = options;
	const fromCache = getLastFrameFromCache({...options, offset: 0});
	if (fromCache) {
		return fromCache;
	}

	const {duration} = await getAudioChannelsAndDuration(src, ffprobeExecutable);
	if (duration === null) {
		throw new Error(
			`Could not determine the duration of ${src} using FFMPEG. The file is not supported.`
		);
	}

	if (options.specialVCodecForTransparency === 'vp8' || offset > 40) {
		const last = await getFrameOfVideoSlow({
			timestamp: duration,
			ffmpegExecutable,
			src,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
		});
		return last;
	}

	const actualOffset = `${duration * 1000 - offset - 10}ms`;
	const {stdout, stderr} = execa(
		ffmpegExecutable ?? 'ffmpeg',
		[
			'-ss',
			actualOffset,
			...determineVcodecFfmepgFlags(options.specialVCodecForTransparency),
			'-i',
			src,
			'-frames:v',
			'1',
			'-c:v',
			options.imageFormat === 'jpeg' ? 'mjpeg' : 'png',
			'-f',
			'image2pipe',
			'-',
		].filter(Internals.truthy)
	);

	if (!stderr) {
		throw new Error('unexpectedly did not get stderr');
	}

	if (!stdout) {
		throw new Error('unexpectedly did not get stdout');
	}

	const stderrChunks: Buffer[] = [];
	const stdoutChunks: Buffer[] = [];

	const stdErrString = new Promise<string>((resolve, reject) => {
		stderr.on('data', (d) => stderrChunks.push(d));
		stderr.on('error', (err) => reject(err));
		stderr.on('end', () =>
			resolve(Buffer.concat(stderrChunks).toString('utf-8'))
		);
	});

	const stdoutChunk = new Promise<Buffer>((resolve, reject) => {
		stdout.on('data', (d) => {
			stdoutChunks.push(d);
		});
		stdout.on('error', (err) => {
			reject(err);
		});
		stdout.on('end', () => {
			resolve(Buffer.concat(stdoutChunks));
		});
	});

	const [stdErr, stdoutBuffer] = await Promise.all([stdErrString, stdoutChunk]);

	const isEmpty = stdErr.includes('Output file is empty');
	if (isEmpty) {
		const unlimited = await getLastFrameOfVideoFastUnlimited({
			ffmpegExecutable,
			offset: offset + 10,
			src,
			ffprobeExecutable,
			imageFormat: options.imageFormat,
			specialVCodecForTransparency: options.specialVCodecForTransparency,
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
};

const extractFrameFromVideoFn = async ({
	time,
	src,
	ffmpegExecutable,
	ffprobeExecutable,
	imageFormat,
}: Options): Promise<Buffer> => {
	await ensurePresentationTimestamps(src);
	const specialVCodecForTransparency: SpecialVCodecForTransparency =
		imageFormat === 'jpeg'
			? 'none'
			: await getSpecialVCodecForTransparency(src, ffprobeExecutable);

	if (specialVCodecForTransparency === 'vp8') {
		return getFrameOfVideoSlow({
			ffmpegExecutable,
			imageFormat,
			specialVCodecForTransparency,
			src,
			timestamp: time,
		});
	}

	if (isBeyondLastFrame(src, time)) {
		const lastFrame = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency,
		});
		return lastFrame;
	}

	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout, stderr} = execa(
		ffmpegExecutable ?? 'ffmpeg',
		[
			'-ss',
			ffmpegTimestamp,
			...determineVcodecFfmepgFlags(specialVCodecForTransparency),
			'-i',
			src,
			'-frames:v',
			'1',
			'-f',
			'image2pipe',
			'-vcodec',
			imageFormat === 'jpeg' ? 'mjpeg' : 'png',
			'-',
		].filter(Internals.truthy),
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
		markAsBeyondLastFrame(src, time);
		const last = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
			imageFormat,
			specialVCodecForTransparency,
		});

		return last;
	}

	return stdOut;
};

export const extractFrameFromVideo = async (options: Options) => {
	const perf = Internals.perf.startPerfMeasure('extract-frame');
	const res = await mainLimit(extractFrameFromVideoFn, options);
	Internals.perf.stopPerfMeasure(perf);
	return res;
};
