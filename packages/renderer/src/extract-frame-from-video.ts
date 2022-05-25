import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {frameToFfmpegTimestamp} from './frame-to-ffmpeg-timestamp';

export const extractFrameFromVideo = ({
	time,
	src,
	ffmpegExecutable,
}: {
	time: number;
	src: string;
	ffmpegExecutable: FfmpegExecutable;
}) => {
	const ffmpegTimestamp = frameToFfmpegTimestamp(time);
	const {stdout} = execa(ffmpegExecutable ?? 'ffmpeg', [
		'-ss',
		ffmpegTimestamp,
		'-i',
		src,
		'-frames:v',
		'1',
		'-f',
		'image2pipe',
		'-',
	]);

	return stdout;
};
