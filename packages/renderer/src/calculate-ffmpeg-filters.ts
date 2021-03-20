import {Internals} from 'remotion';
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
}) => {
	return assetPositions
		.filter((pos) => {
			return (
				(assetAudioDetails.get(resolveAssetSrc(pos.src)) as AssetAudioDetails)
					.channels > 0
			);
		})
		.map((asset, i) => {
			const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
			const assetTrimRight = ((asset.trimLeft + asset.duration) / fps).toFixed(
				3
			);
			const startInVideo = ((asset.startInVideo / fps) * 1000).toFixed(); // in milliseconds
			const audioDetails = assetAudioDetails.get(
				resolveAssetSrc(asset.src)
			) as AssetAudioDetails;

			const streamIndex = i + 1;
			return {
				filter: stringifyFfmpegFilter({
					streamIndex: i + 1,
					channels: audioDetails.channels,
					startInVideo,
					trimLeft: assetTrimLeft,
					trimRight: assetTrimRight,
					volume: 1,
				}),
				streamIndex,
			};
		})
		.filter(Internals.truthy);
};
