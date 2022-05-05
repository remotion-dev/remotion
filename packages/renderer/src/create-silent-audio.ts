import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

export const createSilentAudio = async ({
	ffmpegExecutable,
	numberOfSeconds,
	outName,
}: {
	ffmpegExecutable: FfmpegExecutable;
	numberOfSeconds: number;
	outName: string;
}) => {
	await execa(ffmpegExecutable ?? 'ffmpeg', [
		'-f',
		'lavfi',
		'-i',
		'anullsrc',
		'-c:a',
		'pcm_s16le',
		'-t',
		'-ar',
		String(DEFAULT_SAMPLE_RATE),
		String(numberOfSeconds),
		outName,
	]);
};
