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

export const getLastFrameOfVideo = ({
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

	const chunks: Buffer[] = [];

	return new Promise<Buffer>((resolve, reject) => {
		let isEmpty = false;
		stderr.on('data', (d) => {
			if (d.toString().includes('Output file is empty')) {
				isEmpty = true;
				getLastFrameOfVideo({ffmpegExecutable, offset: offset + 10, src})
					.then((frame) => resolve(frame))
					.catch((err) => reject(err));
			}
		});

		stdout.on('data', (d) => {
			chunks.push(d);
		});
		stdout.on('error', (err) => {
			reject(err);
		});
		stdout.on('end', () => {
			if (!isEmpty) {
				resolve(Buffer.concat(chunks));
			}
		});
	});
};

const limit = pLimit(5);

type Options = {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
};

export const extractFrameFromVideoFn = ({
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

	const chunks: Buffer[] = [];

	return new Promise<Buffer>((resolve, reject) => {
		let isEmpty = false;
		stderr?.on('data', (d) => {
			if (d.toString().includes('Output file is empty')) {
				isEmpty = true;
				getLastFrameOfVideo({ffmpegExecutable, offset: 0, src})
					.then((frame) => resolve(frame))
					.catch((err) => reject(err));
			}
		});

		stdout?.on('data', (d) => {
			chunks.push(d);
		});
		stdout?.on('error', (err) => {
			reject(err);
		});
		stdout?.on('end', () => {
			if (!isEmpty) {
				resolve(Buffer.concat(chunks));
			}
		});
	});
};

export const extractFrameFromVideo = (options: Options) => {
	return limit(extractFrameFromVideoFn, options);
};
