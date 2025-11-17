import type React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RenderAssetManager} from './RenderAssetManager';
import type {DownloadBehavior} from './download-behavior';
import {useCurrentFrame} from './use-current-frame';
import {useRemotionEnvironment} from './use-remotion-environment';

const ArtifactThumbnail = Symbol('Thumbnail');

export const Artifact: React.FC<{
	readonly filename: string;
	readonly content: string | Uint8Array | typeof ArtifactThumbnail;
	readonly downloadBehavior?: DownloadBehavior | null;
}> & {
	Thumbnail: typeof ArtifactThumbnail;
} = ({filename, content, downloadBehavior}) => {
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	const env = useRemotionEnvironment();

	const frame = useCurrentFrame();

	const [id] = useState(() => {
		return String(Math.random());
	});

	useEffect(() => {
		if (!env.isRendering) {
			return;
		}

		if (content instanceof Uint8Array) {
			registerRenderAsset({
				type: 'artifact',
				id,
				content: btoa(new TextDecoder('utf8').decode(content)),
				filename,
				frame,
				contentType: 'binary',
				downloadBehavior: downloadBehavior ?? null,
			});
		} else if (content === ArtifactThumbnail) {
			registerRenderAsset({
				type: 'artifact',
				id,
				filename,
				frame,
				contentType: 'thumbnail',
				downloadBehavior: downloadBehavior ?? null,
			});
		} else {
			registerRenderAsset({
				type: 'artifact',
				id,
				content,
				filename,
				frame,
				contentType: 'text',
				downloadBehavior: downloadBehavior ?? null,
			});
		}

		return () => {
			return unregisterRenderAsset(id);
		};
	}, [
		content,
		env.isRendering,
		filename,
		frame,
		id,
		registerRenderAsset,
		unregisterRenderAsset,
		downloadBehavior,
	]);

	return null;
};

Artifact.Thumbnail = ArtifactThumbnail;
