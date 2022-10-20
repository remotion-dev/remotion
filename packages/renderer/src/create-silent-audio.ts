import execa from 'execa';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {getExecutableBinary} from './ffmpeg-flags';
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
	await execa(
		await getExecutableBinary(ffmpegExecutable, remotionRoot, 'ffmpeg'),
		[
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
		]
	);
};
