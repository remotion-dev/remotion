import type {
	CompositionManagerContext,
	TCompMetadata,
	TComposition,
} from 'remotion';

export const makeCompManagerContext = (composition: TCompMetadata) => {
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

	return memo;
};
