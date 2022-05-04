import {flattenVolumeArray} from './assets/flatten-volume-array';
import {AssetAudioDetails, MediaAsset} from './assets/types';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';
import {resolveAssetSrc} from './resolve-asset-src';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilter = async ({
	asset,
	fps,
	assetAudioDetails,
	durationInFrames,
}: {
	asset: MediaAsset;
	fps: number;
	assetAudioDetails: Map<string, AssetAudioDetails>;
	durationInFrames: number;
}) => {
	const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
	const assetTrimRight = (
		(asset.trimLeft + asset.duration * asset.playbackRate) /
		fps
	).toFixed(3);
	const audioDetails = assetAudioDetails.get(
		resolveAssetSrc(asset.src)
	) as AssetAudioDetails;

	const filter = stringifyFfmpegFilter({
		channels: audioDetails.channels,
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
