import type React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RenderAssetManager} from './RenderAssetManager';
import {getRemotionEnvironment} from './get-remotion-environment';
import {useCurrentFrame} from './use-current-frame';

export const Artifact: React.FC<{
	readonly filename: string;
	readonly content: string | Uint8Array;
}> = ({filename, content}) => {
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	const [env] = useState(() => getRemotionEnvironment());

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
				binary: true,
			});
		} else {
			registerRenderAsset({
				type: 'artifact',
				id,
				content,
				filename,
				frame,
				binary: false,
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
	]);

	return null;
};
