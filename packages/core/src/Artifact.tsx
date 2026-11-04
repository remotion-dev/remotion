import type React from 'react';
import {useContext, useLayoutEffect, useState} from 'react';
import type {DownloadBehavior} from './download-behavior';
import {RenderAssetManager} from './RenderAssetManager';
import {useCurrentFrame} from './use-current-frame';
import {useRemotionEnvironment} from './use-remotion-environment';

const ArtifactThumbnail = Symbol('Thumbnail');

const encodeBinaryArtifact = (bytes: Uint8Array): string => {
	if ('toBase64' in bytes && typeof bytes.toBase64 === 'function') {
		return bytes.toBase64() as string;
	}

	let binary = '';
	for (let offset = 0; offset < bytes.length; offset += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
	}

	return btoa(binary);
};

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

	useLayoutEffect(() => {
		if (!env.isRendering) {
			return;
		}

		if (content instanceof Uint8Array) {
			registerRenderAsset({
				type: 'artifact',
				id,
				content: encodeBinaryArtifact(content),
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
