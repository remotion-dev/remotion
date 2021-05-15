import {getSimultaneousAssets} from './assets/get-simulatenous-assets';
import {AssetAudioDetails, Assets} from './assets/types';
import {resolveAssetSrc} from './resolve-asset-src';
import {stringifyFfmpegFilter} from './stringify-ffmpeg-filter';

export type FfmpegFilterCalculation = {
	filter: string;
	streamIndex: number;
};

export const calculateFfmpegFilters = ({
	assetPositions,
	assetAudioDetails,
	fps,
	videoTrackCount,
}: {
	assetPositions: Assets;
	assetAudioDetails: Map<string, AssetAudioDetails>;
	fps: number;
	videoTrackCount: number;
}): FfmpegFilterCalculation[] => {
	const withMoreThan1Channel = assetPositions.filter((pos) => {
		return (
			(assetAudioDetails.get(resolveAssetSrc(pos.src)) as AssetAudioDetails)
				.channels > 0
		);
	});
	return withMoreThan1Channel.map((asset) => {
		const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
		const assetTrimRight = (
			(asset.trimLeft + asset.duration * asset.playbackRate) /
			fps
		).toFixed(3);
		const audioDetails = assetAudioDetails.get(
			resolveAssetSrc(asset.src)
		) as AssetAudioDetails;
		const simultaneousAssets = getSimultaneousAssets(
			withMoreThan1Channel,
			asset
		);

		const streamIndex = assetPositions.indexOf(asset) + videoTrackCount;
		return {
			filter: stringifyFfmpegFilter({
				streamIndex,
				channels: audioDetails.channels,
				startInVideo: asset.startInVideo,
				trimLeft: assetTrimLeft,
				trimRight: assetTrimRight,
				simulatenousAssets: simultaneousAssets.length,
				volume: asset.volume,
				fps,
				playbackRate: asset.playbackRate,
			}),
			streamIndex,
		};
	});
};
