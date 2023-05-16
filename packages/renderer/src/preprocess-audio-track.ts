import type {DownloadMap} from './assets/download-map';
import {getAudioChannelsAndDuration} from './assets/get-audio-channels';
import type {MediaAsset} from './assets/types';
import {calculateFfmpegFilter} from './calculate-ffmpeg-filters';
import {callFf} from './call-ffmpeg';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';
import {pLimit} from './p-limit';
import {resolveAssetSrc} from './resolve-asset-src';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import type {ProcessedTrack} from './stringify-ffmpeg-filter';

type Options = {
	outName: string;
	asset: MediaAsset;
	expectedFrames: number;
	fps: number;
	downloadMap: DownloadMap;
};

export type PreprocessedAudioTrack = {
	outName: string;
	filter: ProcessedTrack;
};

const preprocessAudioTrackUnlimited = async ({
	outName,
	asset,
	expectedFrames,
	fps,
	downloadMap,
}: Options): Promise<PreprocessedAudioTrack | null> => {
	const {channels, duration} = await getAudioChannelsAndDuration(
		downloadMap,
		resolveAssetSrc(asset.src)
	);

	const filter = calculateFfmpegFilter({
		asset,
		durationInFrames: expectedFrames,
		fps,
		channels,
		assetDuration: duration,
	});

	if (filter === null) {
		return null;
	}

	const {cleanup, file} = await makeFfmpegFilterFile(filter, downloadMap);

	const args = [
		['-i', resolveAssetSrc(asset.src)],
		['-ac', '2'],
		['-filter_script:a', file],
		['-c:a', 'pcm_s16le'],
		['-ar', String(DEFAULT_SAMPLE_RATE)],
		['-y', outName],
	].flat(2);

	await callFf('ffmpeg', args);

	cleanup();
	return {outName, filter};
};

const limit = pLimit(2);

export const preprocessAudioTrack = (options: Options) => {
	return limit(preprocessAudioTrackUnlimited, options);
};
