import execa from 'execa';
import {FfmpegExecutable, Internals} from 'remotion';
import {Readable} from 'stream';
import {getAudioChannelsAndDuration} from './assets/get-audio-channels';
import {ensurePresentationTimestamps} from './ensure-presentation-timestamp';
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

const lastFrameLimit = pLimit(1);
const mainLimit = pLimit(5);

// Uses no seeking, therefore the whole video has to be decoded. This is a last resort and should only happen
// if the video is corrupted
const getLastFrameOfVideoSlow = async ({
	src,
	duration,
	ffmpegExecutable,
}: {
	ffmpegExecutable: FfmpegExecutable;
	src: string;
	duration: number;
}) => {
	console.warn(
		`\nUsing a slow method to determine the last frame of ${src}. The render can be sped up by re-encoding the video properly.`
	);

	const actualOffset = `-${duration * 1000}ms`;
	const command = [
		'-itsoffset',
		actualOffset,
		'-i',
		src,
		'-frames:v',
		'1',
		'-f',
		'image2pipe',
		'-',
	];
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

	if (offset > 40) {
		const last = await getLastFrameOfVideoSlow({
			duration,
			ffmpegExecutable,
			src,
		});
		return last;
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
		const unlimited = await getLastFrameOfVideoFastUnlimited({
			ffmpegExecutable,
			offset: offset + 10,
			src,
			ffprobeExecutable,
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
};

export const extractFrameFromVideoFn = async ({
	time,
	src,
	ffmpegExecutable,
	ffprobeExecutable,
}: Options): Promise<Buffer> => {
	await ensurePresentationTimestamps(src);

	if (isBeyondLastFrame(src, time)) {
		const lastFrame = await getLastFrameOfVideo({
			ffmpegExecutable,
			ffprobeExecutable,
			offset: 0,
			src,
		});
		return lastFrame;
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
