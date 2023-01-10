import type {ComponentType} from 'react';
import {memo} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Internals} from 'remotion';

export const renderSvg = (Comp: ComponentType) => {
	const svg = renderToStaticMarkup(
		<Internals.Timeline.TimelineContext.Provider value={value}>
			<Internals.CompositionManager.Provider value={memo}>
				<Comp />
			</Internals.CompositionManager.Provider>
		</Internals.Timeline.TimelineContext.Provider>
	);
};
