import type React from 'react';
import {useContext, useEffect, useState} from 'react';
import {RenderAssetManager} from './RenderAssetManager';

// TODO: Not register in development?
export const Artifact: React.FC<{
	filename: string;
	content: string;
}> = ({filename, content}) => {
	// TODO: Validate filename and content
	const {registerRenderAsset, unregisterRenderAsset} =
		useContext(RenderAssetManager);

	const [id] = useState(() => {
		return String(Math.random());
	});

	useEffect(() => {
		registerRenderAsset({
			type: 'artifact',
			id,
			content,
			filename,
		});

		return () => {
			return unregisterRenderAsset(id);
		};
	}, [content, filename, id, registerRenderAsset, unregisterRenderAsset]);

	return null;
};
