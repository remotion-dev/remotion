import execa from 'execa';
import {FfmpegExecutable, Internals} from 'remotion';
import {Readable} from 'stream';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';
import {isBeyondLastFrame, markAsBeyondLastFrame} from './is-beyond-last-frame';
import {
	getLastFrameFromCache,
	LastFrameOptions,
	setLastFrameInCache,
} from './last-frame-from-video-cache';
import {pLimit} from './p-limit';

export function streamToString(stream: Readable) {
	const chunks: Buffer[] = [];
	return new Promise<string>((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}

const lastFrameLimit = pLimit(5);
const mainLimit = pLimit(5);

const getLastFrameOfVideoUnlimited = async ({
	ffmpegExecutable,
	ffprobeExecutable,
	offset,
	src,
}: LastFrameOptions): Promise<Buffer> => {
	if (offset > 600) {
		throw new Error(
			'could not get last frame of ' +
				src +
				'. Tried to seek 100ms before the end of the video and no frame was found. The video container has a duration that is longer than it contains video.'
		);
	}

	const durationCmd = await execa(ffprobeExecutable ?? 'ffprobe', [
		'-v',
		'error',
		'-select_streams',
		'v:0',
		'-show_entries',
		'stream=duration',
		'-of',
		'default=noprint_wrappers=1:nokey=1',
		src,
	]);

	const duration = parseFloat(durationCmd.stdout);

	if (Number.isNaN(duration)) {
		throw new TypeError(
			`Could not get duration of ${src}: ${durationCmd.stdout}`
		);
	}

	const actualOffset = `${duration * 1000 - offset - 10}ms`;
	const {stdout, stderr} = execa(ffmpegExecutable ?? 'ffmpeg', [
		'-ss',
		actualOffset,
		'-i',
		src,
		'-frames:v',
		'1',
		'-f',
		'image2pipe',
		'-',
	]);

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
		return getLastFrameOfVideoUnlimited({
			ffmpegExecutable,
			offset: offset + 10,
			src,
			ffprobeExecutable,
		});
	}

	return stdoutBuffer;
};

export const getLastFrameOfVideo = async (
	options: LastFrameOptions
): Promise<Buffer> => {
	const fromCache = getLastFrameFromCache(options);
	if (fromCache) {
		return fromCache;
	}

	const result = await lastFrameLimit(getLastFrameOfVideoUnlimited, options);
	setLastFrameInCache(options, result);

	return result;
};

type Options = {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
};

export const extractFrameFromVideoFn = async ({
	time,
	src,
	ffmpegExecutable,
	ffprobeExecutable,
}: Options): Promise<Buffer> => {
	if (isBeyondLastFrame(src, time)) {
		return getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
		});
	}

	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout, stderr} = execa(
		ffmpegExecutable ?? 'ffmpeg',
		[
			'-ss',
			ffmpegTimestamp,
			'-i',
			src,
			'-frames:v',
			'1',
			'-f',
			'image2pipe',
			'-',
		],
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
		stderr.on('data', (d) => {
			stderrChunks.push(d);
		});
		stderr.on('error', (err) => {
			reject(err);
		});
		stderr.on('end', () => {
			resolve(Buffer.concat(stderrChunks).toString('utf8'));
		});
	});

	const stdoutBuffer = new Promise<Buffer>((resolve, reject) => {
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

	const [stderrStr, stdOut] = await Promise.all([
		stderrStringProm,
		stdoutBuffer,
	]);

	if (stderrStr.includes('Output file is empty')) {
		markAsBeyondLastFrame(src, time);
		return getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
		});
	}

	return stdOut;
};

export const extractFrameFromVideo = async (options: Options) => {
	const perf = Internals.perf.startPerfMeasure('extract-frame');
	const res = await mainLimit(extractFrameFromVideoFn, options);
	Internals.perf.stopPerfMeasure(perf);
	return res;
};
