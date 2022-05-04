import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {MediaAsset} from './assets/types';
import {calculateFfmpegFilter} from './calculate-ffmpeg-filters';
import {pLimit} from './p-limit';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';

type Options = {
	ffmpegExecutable: FfmpegExecutable;
	outName: string;
	onProgress: (progress: number) => void;
	asset: MediaAsset;
	expectedFrames: number;
	fps: number;
};

const preprocessAudioTrackUnlimited = async ({
	ffmpegExecutable,
	outName,
	onProgress,
	asset,
	expectedFrames,
	fps,
}: Options) => {
	const data = await calculateFfmpegFilter({
		asset,
		durationInFrames: expectedFrames,
		fps,
	});

	if (data === null) {
		onProgress(1);
		return;
	}

	const {filter, src, cleanup} = data;

	const args = [
		['-i', src],
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
	cleanup();
};

const limit = pLimit(2);

export const preprocessAudioTrack = (options: Options) => {
	return limit(preprocessAudioTrackUnlimited, options);
};
