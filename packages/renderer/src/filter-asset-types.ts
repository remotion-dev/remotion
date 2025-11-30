import type {
	ArtifactAsset,
	AudioOrVideoAsset,
	InlineAudioAsset,
	TRenderAsset,
} from 'remotion/no-react';
import type {EmittedArtifact} from './serialize-artifact';
import {truthy} from './truthy';

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

	return artifacts
		.map((artifact): EmittedArtifact | null => {
			if (
				artifact.contentType === 'binary' ||
				artifact.contentType === 'text'
			) {
				return {
					frame: artifact.frame,
					content: artifact.content,
					filename: artifact.filename,
					downloadBehavior: artifact.downloadBehavior,
				};
			}

			if (artifact.contentType === 'thumbnail') {
				if (frameBuffer === null) {
					// A thumbnail artifact was defined to be emitted, but the output was not a video.
					// Also, in Lambda, there are extra frames which are not video frames.
					// This could happen if a thumbnail is unconditionally emitted.
					return null;
				}

				return {
					frame: artifact.frame,
					content: new Uint8Array(frameBuffer),
					filename: artifact.filename,
					downloadBehavior: artifact.downloadBehavior,
				};
			}

			throw new Error('Unknown artifact type: ' + (artifact satisfies never));
		})
		.filter(truthy);
};

export const onlyInlineAudio = (assets: TRenderAsset[]): InlineAudioAsset[] => {
	return assets.filter(
		(asset) => asset.type === 'inline-audio',
	) as InlineAudioAsset[];
};
