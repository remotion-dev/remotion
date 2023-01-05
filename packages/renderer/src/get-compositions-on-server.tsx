import type {ComponentType} from 'react';
import {renderToString} from 'react-dom/server';
import type {TCompMetadata} from 'remotion';

export const getCompositionsOnServer = (Comp: ComponentType) => {
	process.env.REMOTION_SERVER_RENDERING = 'true';
	const str = renderToString(<Comp />);

	const matches = str.matchAll(/<div>(.*?)<\/div>/g);
	const metadata: TCompMetadata[] = [];

	for (const match of matches) {
		const json = JSON.parse(match[1]);
		metadata.push(json);
	}

	return metadata;
};
