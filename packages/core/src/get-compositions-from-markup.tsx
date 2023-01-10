import type {ComponentType} from 'react';
import {renderToString} from 'react-dom/server';
import {GetCompositionsFromMarkupModeProvider} from './Composition';
import type {TCompMetadata} from './CompositionManager';

export const getCompositionsFromMarkup = (Comp: ComponentType) => {
	// TODO: Is this still necessary?
	process.env.REMOTION_SERVER_RENDERING = 'true';
	const str = renderToString(
		<GetCompositionsFromMarkupModeProvider>
			<Comp />
		</GetCompositionsFromMarkupModeProvider>
	);

	const matches = str.matchAll(/<div>(.*?)<\/div>/g);
	const metadata: TCompMetadata[] = [];

	for (const match of matches) {
		const json = JSON.parse(match[1]);
		metadata.push(json);
	}

	return metadata;
};
