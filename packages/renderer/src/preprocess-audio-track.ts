import execa from 'execa';
import {FfmpegExecutable} from 'remotion';
import {getAudioChannels} from './assets/get-audio-channels';
import {MediaAsset} from './assets/types';
import {calculateFfmpegFilter} from './calculate-ffmpeg-filters';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';
import {pLimit} from './p-limit';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {resolveAssetSrc} from './resolve-asset-src';
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
	const channels = await getAudioChannels(resolveAssetSrc(asset.src));

	const filter = await calculateFfmpegFilter({
		asset,
		durationInFrames: expectedFrames,
		fps,
		channels,
	});

	if (filter === null) {
		onProgress(1);
		return;
	}

	const {cleanup, file} = await makeFfmpegFilterFile(filter);

	const args = [
		['-i', resolveAssetSrc(asset.src)],
		['-ac', '2'],
		['-filter_script:a', file],
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
