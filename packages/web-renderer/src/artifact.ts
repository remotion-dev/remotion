import type {DownloadBehavior, TRenderAsset} from 'remotion';
import {NoReactInternals, type ArtifactAsset} from 'remotion/no-react';

export type EmittedArtifact = {
	filename: string;
	content: string | Uint8Array;
	frame: number;
	downloadBehavior: DownloadBehavior | null;
};

export const onlyArtifact = async ({
	assets,
	frameBuffer,
}: {
	assets: TRenderAsset[];
	frameBuffer: Blob | OffscreenCanvas | null;
}): Promise<EmittedArtifact[]> => {
	const artifacts = assets.filter(
		(asset) => asset.type === 'artifact',
	) as ArtifactAsset[];

	let frameBufferUint8: Uint8Array | null = null;

	const result: EmittedArtifact[] = [];
	for (const artifact of artifacts) {
		if (artifact.contentType === 'binary' || artifact.contentType === 'text') {
			result.push({
				frame: artifact.frame,
				content: artifact.content,
				filename: artifact.filename,
				downloadBehavior: artifact.downloadBehavior,
			});
			continue;
		}

		if (artifact.contentType === 'thumbnail') {
			if (frameBuffer === null) {
				// A thumbnail artifact was defined to be emitted, but the output was not a video.
				// Also, in Lambda, there are extra frames which are not video frames.
				// This could happen if a thumbnail is unconditionally emitted.
				continue;
			}

			const ab =
				frameBuffer instanceof Blob
					? await frameBuffer.arrayBuffer()
					: new Uint8Array(
							await (
								await frameBuffer.convertToBlob({type: 'image/png'})
							).arrayBuffer(),
						);
			frameBufferUint8 = new Uint8Array(ab);

			result.push({
				frame: artifact.frame,
				content: frameBufferUint8 as Uint8Array,
				filename: artifact.filename,
				downloadBehavior: artifact.downloadBehavior,
			});
			continue;
		}

		throw new Error('Unknown artifact type: ' + (artifact satisfies never));
	}

	return result.filter(NoReactInternals.truthy);
};

export type OnArtifact = (asset: EmittedArtifact) => void;
export type ArtifactsRef = React.RefObject<{
	collectAssets: () => TRenderAsset[];
} | null>;

type PreviousArtifact = {
	frame: number;
	filename: string;
};

export const handleArtifacts = () => {
	const previousArtifacts: PreviousArtifact[] = [];

	const handle = async ({
		imageData,
		frame,
		assets: artifactAssets,
		onArtifact,
	}: {
		imageData: Blob | OffscreenCanvas | null;
		frame: number;
		assets: TRenderAsset[];
		onArtifact: OnArtifact | null;
	}) => {
		if (onArtifact) {
			const artifacts = await onlyArtifact({
				assets: artifactAssets,
				frameBuffer: imageData,
			});
			for (const artifact of artifacts) {
				const previousArtifact = previousArtifacts.find(
					(a) => a.filename === artifact.filename,
				);
				if (previousArtifact) {
					throw new Error(
						`An artifact with output "${artifact.filename}" was already registered at frame ${previousArtifact.frame}, but now registered again at frame ${frame}. Artifacts must have unique names. https://remotion.dev/docs/artifacts`,
					);
				}

				onArtifact(artifact);
				previousArtifacts.push({frame, filename: artifact.filename});
			}
		}
	};

	return {handle};
};
