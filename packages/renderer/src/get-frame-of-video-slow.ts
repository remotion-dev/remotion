// Uses no seeking, therefore the whole video has to be decoded. This is a last resort and should only happen
// if the video is corrupted
import type {OffthreadVideoImageFormat} from 'remotion';
import type {SpecialVCodecForTransparency} from './assets/download-map';
import {callFf} from './call-ffmpeg';
import {determineResizeParams} from './determine-resize-params';
import {determineVcodecFfmpegFlags} from './determine-vcodec-ffmpeg-flags';
import {truthy} from './truthy';
export const getFrameOfVideoSlow = async ({
	src,
	duration,
	imageFormat,
	specialVCodecForTransparency,
	needsResize,
	offset,
	fps,
}: {
	src: string;
	duration: number;
	imageFormat: OffthreadVideoImageFormat;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
	needsResize: [number, number] | null;
	offset: number;
	fps: number | null;
}): Promise<Buffer> => {
	console.warn(
		`\nUsing a slow method to extract the frame at ${duration}ms of ${src}. See https://remotion.dev/docs/slow-method-to-extract-frame for advice`
	);

	const actualOffset = `-${duration * 1000 - offset}ms`;
	const command = [
		'-itsoffset',
		actualOffset,
		...determineVcodecFfmpegFlags(specialVCodecForTransparency),
		'-i',
		src,
		'-frames:v',
		'1',
		'-c:v',
		imageFormat === 'jpeg' ? 'mjpeg' : 'png',
		'-f',
		'image2pipe',
		...determineResizeParams(needsResize),
		'-',
	].filter(truthy);

	const {stdout, stderr} = callFf('ffmpeg', command);

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
		if (offset > 70) {
			throw new Error(
				`Could not get last frame of ${src}. Tried to seek to the end using the command "ffmpeg ${command.join(
					' '
				)}" but got no frame. Most likely this video is corrupted.`
			);
		}

		return getFrameOfVideoSlow({
			duration,
			// Decrement in 10ms increments, or 1 frame (e.g. fps = 25 --> 40ms)
			offset: offset + (fps === null ? 10 : 1000 / fps),
			src,
			imageFormat,
			specialVCodecForTransparency,
			needsResize,
			fps,
		});
	}

	return stdoutBuffer;
};
