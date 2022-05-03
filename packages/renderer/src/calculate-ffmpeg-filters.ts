import {flattenVolumeArray} from './assets/flatten-volume-array';
import {AssetAudioDetails, Assets} from './assets/types';
import {resolveAssetSrc} from './resolve-asset-src';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export const calculateFfmpegFilters = ({
	assetPositions,
	assetAudioDetails,
	fps,
}: {
	assetPositions: Assets;
	assetAudioDetails: Map<string, AssetAudioDetails>;
	fps: number;
}): {filter: string; src: string}[] => {
	const withAtLeast1Channel = assetPositions.filter((pos) => {
		return (
			(assetAudioDetails.get(resolveAssetSrc(pos.src)) as AssetAudioDetails)
				.channels > 0
		);
	});
	return withAtLeast1Channel.map((asset) => {
		const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
		const assetTrimRight = (
			(asset.trimLeft + asset.duration * asset.playbackRate) /
			fps
		).toFixed(3);
		const audioDetails = assetAudioDetails.get(
			resolveAssetSrc(asset.src)
		) as AssetAudioDetails;

		return {
			// TODO: Put into a file to deal with long volume commands
			// TODO: Test if playbackRate is also fixed
			filter: stringifyFfmpegFilter({
				channels: audioDetails.channels,
				startInVideo: asset.startInVideo,
				trimLeft: assetTrimLeft,
				trimRight: assetTrimRight,
				volume: flattenVolumeArray(asset.volume),
				fps,
				playbackRate: asset.playbackRate,
			}),
			src: resolveAssetSrc(asset.src),
		};
	});
};
