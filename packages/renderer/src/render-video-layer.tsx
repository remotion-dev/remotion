import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {TCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import {makeCompManagerContext} from './make-comp-manager-context';
import {makeTimelineContextValue} from './make-timeline-context-value';

export const renderVideoLayer = ({
	composition,
	Comp,
	frame,
	layer,
}: {
	composition: TCompMetadata;
	Comp: ComponentType;
	frame: number;
	layer: number;
}) => {
	const svg = renderToStaticMarkup(
		<Internals.SelectCompositionMode layer={layer} id={composition.id}>
			<Internals.Timeline.TimelineContext.Provider
				value={makeTimelineContextValue(composition, frame)}
			>
				<Internals.CompositionManager.Provider
					value={makeCompManagerContext(composition)}
				>
					<Comp />
				</Internals.CompositionManager.Provider>
			</Internals.Timeline.TimelineContext.Provider>
		</Internals.SelectCompositionMode>
	);
	console.log({svg});

	return svg;
};
