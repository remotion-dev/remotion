import execa from 'execa';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableFfmpeg} from './ffmpeg-flags';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const createSilentAudio = async ({
	ffmpegExecutable,
	numberOfSeconds,
	outName,
	remotionRoot,
}: {
	ffmpegExecutable: FfmpegExecutable;
	numberOfSeconds: number;
	outName: string;
	remotionRoot: string;
}) => {
	await execa(await getExecutableFfmpeg(ffmpegExecutable, remotionRoot), [
		'-f',
		'lavfi',
		'-i',
		`anullsrc=r=${DEFAULT_SAMPLE_RATE}`,
		'-c:a',
		'pcm_s16le',
		'-t',
		String(numberOfSeconds),
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		outName,
	]);
};
