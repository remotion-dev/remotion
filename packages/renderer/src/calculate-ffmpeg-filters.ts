import {flattenVolumeArray} from './assets/flatten-volume-array';
import {AssetAudioDetails, Assets} from './assets/types';
import {makeFfmpegFilterFile} from './ffmpeg-filter-file';
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
}): Promise<{filter: string; src: string; cleanup: () => void}[]> => {
	const withAtLeast1Channel = assetPositions.filter((pos) => {
		return (
			(assetAudioDetails.get(resolveAssetSrc(pos.src)) as AssetAudioDetails)
				.channels > 0
		);
	});
	return Promise.all(
		withAtLeast1Channel.map(async (asset) => {
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
			});

			const {cleanup, file: filterFile} = await makeFfmpegFilterFile(filter);

			return {
				// TODO: Test if playbackRate is also fixed
				filter: filterFile,
				src: resolveAssetSrc(asset.src),
				cleanup,
			};
		})
	);
};
