import execa from 'execa';
import type {FfmpegExecutable} from './ffmpeg-executable';
import { getExecutableFfmpeg } from './ffmpeg-flags';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const convertToPcm = async ({
	ffmpegExecutable,
	input,
	outName,
}: {
	ffmpegExecutable: FfmpegExecutable;
	input: string;
	outName: string;
}) => {
	await execa(await getExecutableFfmpeg(ffmpegExecutable), [
		'-i',
		input,
		'-c:a',
		'pcm_s16le',
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		outName,
	]);
};
