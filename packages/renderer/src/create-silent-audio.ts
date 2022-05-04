import execa from 'execa';
import {FfmpegExecutable} from 'remotion';

export const createSilentAudio = async ({
	ffmpegExecutable,
	audioCodec,
	numberOfSeconds,
	outName,
}: {
	ffmpegExecutable: FfmpegExecutable;
	audioCodec: string;
	numberOfSeconds: number;
	outName: string;
}) => {
	await execa(ffmpegExecutable ?? 'ffmpeg', [
		'-f',
		'lavfi',
		'-i',
		'anullsrc',
		'-c:a',
		audioCodec,
		'-t',
		String(numberOfSeconds),
		outName,
	]);
};
