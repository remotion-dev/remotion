import type React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RenderAssetManager} from './RenderAssetManager';
import {useCurrentFrame} from './use-current-frame';

// TODO: Not register in development?
export const Artifact: React.FC<{
	readonly filename: string;
	readonly content: string;
}> = ({filename, content}) => {
	// TODO: Validate filename and content
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);
	const frame = useCurrentFrame();

	const [id] = useState(() => {
		return String(Math.random());
	});

	useEffect(() => {
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
		filename,
		frame,
		id,
		registerRenderAsset,
		unregisterRenderAsset,
	]);

	return null;
};
