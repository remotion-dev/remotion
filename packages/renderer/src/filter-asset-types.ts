import type {
	ArtifactAsset,
	AudioOrVideoAsset,
	TRenderAsset,
} from 'remotion/no-react';
import type {EmittedArtifact} from './serialize-artifact';

export const onlyAudioAndVideoAssets = (
	assets: TRenderAsset[],
): AudioOrVideoAsset[] => {
	return assets.filter(
		(asset) => asset.type === 'audio' || asset.type === 'video',
	) as AudioOrVideoAsset[];
};

export const onlyArtifact = ({
	assets,
	frameBuffer,
}: {
	assets: TRenderAsset[];
	frameBuffer: Buffer | null;
}): EmittedArtifact[] => {
	const artifacts = assets.filter(
		(asset) => asset.type === 'artifact',
	) as ArtifactAsset[];

	return artifacts.map((artifact): EmittedArtifact => {
		if (artifact.contentType === 'binary' || artifact.contentType === 'text') {
			return {
				frame: artifact.frame,
				content: artifact.content,
				filename: artifact.filename,
			};
		}

		if (artifact.contentType === 'thumbnail') {
			if (frameBuffer === null) {
				throw new Error(
					'A thumbnail artifact was defined to be emitted, but the output was not a video.',
				);
			}

			return {
				frame: artifact.frame,
				content: new Uint8Array(frameBuffer),
				filename: artifact.filename,
			};
		}

		throw new Error('Unknown artifact type: ' + (artifact satisfies never));
	});
};
