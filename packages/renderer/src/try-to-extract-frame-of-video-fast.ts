import type {OffthreadVideoImageFormat} from 'remotion';
import {RenderInternals} from '.';
import type {
	NeedsResize,
	SpecialVCodecForTransparency,
} from './assets/download-map';
import {determineResizeParams} from './determine-resize-params';
import {determineVcodecFfmpegFlags} from './determine-vcodec-ffmpeg-flags';
import {truthy} from './truthy';

export const tryToExtractFrameOfVideoFast = async ({
	specialVCodecForTransparency,
	imageFormat,
	needsResize,
	src,
	actualOffset,
}: {
	imageFormat: OffthreadVideoImageFormat;
	needsResize: NeedsResize;
	src: string;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
	actualOffset: string;
}) => {
	const {stdout, stderr} = RenderInternals.callFf(
		'ffmpeg',
		[
			'-ss',
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
		].filter(truthy)
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
	return [stdErr, stdoutBuffer] as const;
};
