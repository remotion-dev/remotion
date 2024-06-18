import type React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RenderAssetManager} from './RenderAssetManager';
import {getRemotionEnvironment} from './get-remotion-environment';
import {useCurrentFrame} from './use-current-frame';

export const Artifact: React.FC<{
	readonly filename: string;
	readonly content: string;
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

		registerRenderAsset({
			type: 'artifact',
			id,
			content,
			filename,
			frame,
		});

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
