import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	audioFile: string;
	filter: string;
	outName: string;
	onProgress: (progress: number) => void;
};

export const preprocessAudioTrack = async ({
	ffmpegExecutable,
	audioFile,
	filter,
	outName,
	onProgress,
}: Options) => {
	const args = [
		['-i', audioFile],
		['-ac', '2'],
		['-filter_script:a', filter],
		['-ar', String(DEFAULT_SAMPLE_RATE)],
		['-c:a', 'aac'],
		['-y', outName],
	].flat(2);

	const task = execa(ffmpegExecutable ?? 'ffmpeg', args);

	task.stderr?.on('data', (data: Buffer) => {
		const str = data.toString();
		const parsed = parseFfmpegProgress(str);
		if (parsed !== undefined) {
			onProgress(parsed);
		}
	});

	await task;
};
