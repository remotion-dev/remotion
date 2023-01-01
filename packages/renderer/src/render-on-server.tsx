import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {
	CompositionManagerContext,
	TCompMetadata,
	TComposition,
	TimelineContextValue,
} from 'remotion';
import {Internals} from 'remotion';

export const renderOnServer = (
	Comp: ComponentType,
	composition: TCompMetadata
) => {
	process.env.REMOTION_SERVER_RENDERING = 'true';
	process.env.SELECT_COMP_ID = composition.id;

	// eslint-disable-next-line react/jsx-no-constructed-context-values
	const memo: CompositionManagerContext = {
		assets: [],
		compositions: [composition as unknown as TComposition<unknown>],
		currentComposition: composition.id,
		currentCompositionMetadata: composition,
		folders: [],
		registerAsset: () => {
			throw new Error('Not implemented');
		},
		registerComposition: () => {
			throw new Error('Not implemented');
		},
		registerFolder: () => {
			throw new Error('Not implemented');
		},
		setCurrentComposition: () => {
			throw new Error('Not implemented');
		},
		registerSequence() {
			throw new Error('Not implemented');
		},
		sequences: [],
		setCurrentCompositionMetadata: () => {
			throw new Error('Not implemented');
		},
		unregisterAsset: () => {
			throw new Error('Not implemented');
		},
		unregisterComposition: () => {
			throw new Error('Not implemented');
		},
		unregisterFolder: () => {
			throw new Error('Not implemented');
		},
		unregisterSequence: () => {
			throw new Error('Not implemented');
		},
	};

	// eslint-disable-next-line react/jsx-no-constructed-context-values
	const value: TimelineContextValue = {
		audioAndVideoTags: {current: []},
		rootId: composition.id,
		playing: false,
		playbackRate: 1,
		imperativePlaying: {
			current: false,
		},
		frame: 0,
		setPlaybackRate: () => {
			throw new Error('Not implemented');
		},
	};

	const selectComp = renderToStaticMarkup(
		<Internals.Timeline.TimelineContext.Provider value={value}>
			<Internals.CompositionManager.Provider value={memo}>
				<Comp />
			</Internals.CompositionManager.Provider>
		</Internals.Timeline.TimelineContext.Provider>
	);
	console.log(selectComp);
};
