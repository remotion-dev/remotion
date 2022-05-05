import execa from 'execa';
import {FfmpegExecutable} from 'remotion';

export const convertToPcm = async ({
	ffmpegExecutable,
	input,
	outName,
}: {
	ffmpegExecutable: FfmpegExecutable;
	input: string;
	outName: string;
}) => {
	await execa(ffmpegExecutable ?? 'ffmpeg', [
		'-i',
		input,
		'-c:a',
		'pcm_s16le',
		'-t',
		outName,
	]);
};
