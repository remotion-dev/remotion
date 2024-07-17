import type {
	ArtifactAsset,
	AudioOrVideoAsset,
	TRenderAsset,
} from 'remotion/no-react';

export const onlyAudioAndVideoAssets = (
	assets: TRenderAsset[],
): AudioOrVideoAsset[] => {
	return assets.filter(
		(asset) => asset.type === 'audio' || asset.type === 'video',
	) as AudioOrVideoAsset[];
};

export const onlyArtifact = (assets: TRenderAsset[]): ArtifactAsset[] => {
	return assets.filter((asset) => asset.type === 'artifact') as ArtifactAsset[];
};
