import execa from 'execa';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableFfmpeg} from './ffmpeg-flags';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const convertToPcm = async ({
	ffmpegExecutable,
	input,
	outName,
	remotionRoot,
}: {
	ffmpegExecutable: FfmpegExecutable;
	input: string;
	outName: string;
	remotionRoot: string;
}) => {
	await execa(
		await getExecutableFfmpeg(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		[
			'-i',
			input,
			'-c:a',
			'pcm_s16le',
			'-ar',
			String(DEFAULT_SAMPLE_RATE),
			outName,
		]
	);
};
