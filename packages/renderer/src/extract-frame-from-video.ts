import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {Readable} from 'stream';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';
import {pLimit} from './p-limit';

export function streamToString(stream: Readable) {
	const chunks: Buffer[] = [];
	return new Promise<string>((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}

export const getLastFrameOfVideo = async ({
	ffmpegExecutable,
	offset,
	src,
}: {
	ffmpegExecutable: FfmpegExecutable;
	offset: number;
	src: string;
}): Promise<Buffer> => {
	if (offset > 100) {
		throw new Error(
			'could not get last frame of ' +
				src +
				'. Tried to seek 100ms before the end of the video and no frame was found. The video container has a duration that is longer than it contains video.'
		);
	}

	const actualOffset = `-${offset + 10}ms`;
	const {stdout, stderr} = execa(ffmpegExecutable ?? 'ffmpeg', [
		'-sseof',
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
		return getLastFrameOfVideo({ffmpegExecutable, offset: offset + 10, src});
	}

	return stdoutBuffer;
};

const limit = pLimit(5);

type Options = {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
};

export const extractFrameFromVideoFn = async ({
	time,
	src,
	ffmpegExecutable,
}: Options): Promise<Buffer> => {
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
		return getLastFrameOfVideo({
			ffmpegExecutable,
			offset: 0,
			src,
		});
	}

	return stdOut;
};

export const extractFrameFromVideo = (options: Options) => {
	return limit(extractFrameFromVideoFn, options);
};
