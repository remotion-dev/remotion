import execa from 'execa';
import {FfmpegExecutable} from 'remotion';

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
		String(numberOfSeconds),
		outName,
	]);
};
