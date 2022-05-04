import {flattenVolumeArray} from './assets/flatten-volume-array';
import {getAudioChannels} from './assets/get-audio-channels';
import {MediaAsset} from './assets/types';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';
import {resolveAssetSrc} from './resolve-asset-src';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

type ReturnValue = {
	cleanup: () => void;
	src: string;
	filter: string;
};

export const calculateFfmpegFilter = async ({
	asset,
	fps,
	durationInFrames,
}: {
	asset: MediaAsset;
	fps: number;
	durationInFrames: number;
}): Promise<ReturnValue | null> => {
	const channels = await getAudioChannels(resolveAssetSrc(asset.src));

	if (channels === 0) {
		null;
	}

	const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
	const assetTrimRight = (
		(asset.trimLeft + asset.duration * asset.playbackRate) /
		fps
	).toFixed(3);

	const filter = stringifyFfmpegFilter({
		channels,
		startInVideo: asset.startInVideo,
		trimLeft: assetTrimLeft,
		trimRight: assetTrimRight,
		volume: flattenVolumeArray(asset.volume),
		fps,
		playbackRate: asset.playbackRate,
		durationInFrames,
	});

	const {cleanup, file: filterFile} = await makeFfmpegFilterFile(filter);

	return {
		// TODO: Test if playbackRate is also fixed
		filter: filterFile,
		src: resolveAssetSrc(asset.src),
		cleanup,
	};
};
