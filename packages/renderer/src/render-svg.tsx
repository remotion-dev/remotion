import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {
	SmallTCompMetadata,
	TCompMetadata,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';
import {makeCompManagerContext} from './make-comp-manager-context';

const makeTimelineContextValue = (
	composition: SmallTCompMetadata,
	frame: number
) => {
	const value: TimelineContextValue = {
		audioAndVideoTags: {current: []},
		rootId: composition.id,
		playing: false,
		playbackRate: 1,
		imperativePlaying: {
			current: false,
		},
		frame,
		setPlaybackRate: () => {
			throw new Error('Not implemented');
		},
	};

	return value;
};

export const renderSvg = (
	composition: TCompMetadata,
	Comp: ComponentType,
	frame: number
) => {
	const svg = renderToStaticMarkup(
		<Internals.Timeline.TimelineContext.Provider
			value={makeTimelineContextValue(composition, frame)}
		>
			<Internals.CompositionManager.Provider
				value={makeCompManagerContext(composition)}
			>
				<Internals.SelectCompositionMode id={composition.id}>
					<Comp />
				</Internals.SelectCompositionMode>
			</Internals.CompositionManager.Provider>
		</Internals.Timeline.TimelineContext.Provider>
	);

	return svg;
};
