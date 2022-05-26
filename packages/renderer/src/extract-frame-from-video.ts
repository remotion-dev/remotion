import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {Readable} from 'stream';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';

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
}): Promise<Readable> => {
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

	const info = await streamToString(stderr as Readable);
	if (info.includes('Output file is empty')) {
		return getLastFrameOfVideo({ffmpegExecutable, offset: offset + 10, src});
	}

	return stdout as Readable;
};

export const extractFrameFromVideo = async ({
	time,
	src,
	ffmpegExecutable,
}: {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
}): Promise<Readable | null> => {
	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout, stderr} = execa(ffmpegExecutable ?? 'ffmpeg', [
		'-ss',
		ffmpegTimestamp,
		'-i',
		src,
		'-frames:v',
		'1',
		'-f',
		'image2pipe',
		'-',
	]);

	const info = await streamToString(stderr as Readable);
	if (info.includes('Output file is empty')) {
		return getLastFrameOfVideo({
			ffmpegExecutable,
			offset: 0,
			src,
		});
	}

	return stdout as Readable;
};
