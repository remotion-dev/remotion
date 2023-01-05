import type {ComponentType} from 'react';
import {renderToString} from 'react-dom/server';
import type {TCompMetadata} from './CompositionManager';
import {Internals} from './internals';

export const getCompositionsFromMarkup = (Comp: ComponentType) => {
	process.env.REMOTION_SERVER_RENDERING = 'true';
	const str = renderToString(
		<Internals.GetCompositionsFromMarkupModeProvider>
			<Comp />
		</Internals.GetCompositionsFromMarkupModeProvider>
	);

	const matches = str.matchAll(/<div>(.*?)<\/div>/g);
	const metadata: TCompMetadata[] = [];

	for (const match of matches) {
		const json = JSON.parse(match[1]);
		metadata.push(json);
	}

	return metadata;
};
