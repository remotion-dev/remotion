import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {TCompMetadata} from 'remotion';
import {Internals} from 'remotion';
import type {NativeVideoLayerInfo} from 'remotion/src/video/NativeVideoForRendering';
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
	process.env.REMOTION_SERVER_RENDERING = 'true';

	const markup = renderToStaticMarkup(
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

	const matches = markup.matchAll(/<div>(.*?)<\/div>/g);

	let parsed: NativeVideoLayerInfo | null = null;

	for (const match of matches) {
		if (parsed) {
			throw new Error('cannot have more than one video layer');
		}

		const json = JSON.parse(match[1]);
		parsed = json as NativeVideoLayerInfo;
	}

	return parsed;
};
