import execa from 'execa';
import type {OffthreadVideoImageFormat} from 'remotion';
import type {
	NeedsResize,
	SpecialVCodecForTransparency,
} from './assets/download-map';
import {determineResizeParams} from './determine-resize-params';
import {determineVcodecFfmepgFlags} from './determine-vcodec-ffmepg-flags';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableBinary} from './ffmpeg-flags';
import {truthy} from './truthy';
export const tryToExtractFrameOfVideoFast = async ({
	ffmpegExecutable,
	remotionRoot,
	specialVCodecForTransparency,
	imageFormat,
	needsResize,
	src,
	actualOffset,
}: {
	ffmpegExecutable: FfmpegExecutable;
	remotionRoot: string;
	imageFormat: OffthreadVideoImageFormat;
	needsResize: NeedsResize;
	src: string;
	specialVCodecForTransparency: SpecialVCodecForTransparency;
	actualOffset: string;
}) => {
	const {stdout, stderr} = execa(
		await getExecutableBinary(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		[
			'-ss',
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
