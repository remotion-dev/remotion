import {Internals} from 'remotion';
import {AssetAudioDetails, Assets} from './assets/types';
import {resolveAssetSrc} from './resolve-asset-src';

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
		.map((asset, i) => {
			const duration = (asset.duration / fps).toFixed(3); // in seconds with milliseconds level precision
			const assetTrimLeft = (asset.trimLeft / fps).toFixed(3);
			const assetTrimRight = ((asset.trimLeft + asset.duration) / fps).toFixed(
				3
			);
			const startInVideo = ((asset.startInVideo / fps) * 1000).toFixed(); // in milliseconds
			const audioDetails = assetAudioDetails.get(
				resolveAssetSrc(asset.src)
			) as AssetAudioDetails;

			if (audioDetails.channels === 0) {
				return null;
			}
			const streamIndex = i + 1;
			return {
				filter:
					`[${streamIndex}:a]` +
					[
						duration ? `atrim=${assetTrimLeft}:${assetTrimRight}` : '',
						`adelay=${new Array(audioDetails.channels)
							.fill(startInVideo)
							.join('|')}`,
					]
						.filter(Internals.truthy)
						.join(',') +
					`[a${streamIndex}]`,
				streamIndex,
			};
		})
		.filter(Internals.truthy);
};
