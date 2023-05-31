import {createContext} from 'react';
import type {AnyZodObject} from 'zod';
import type {
	AnyCompMetadata,
	AnyComposition,
	TAsset,
	TComposition,
	TSequence,
} from './CompositionManager.js';
import type {TFolder} from './Folder.js';

export type BaseMetadata = Pick<
	AnyCompMetadata,
	'durationInFrames' | 'fps' | 'defaultProps' | 'height' | 'width'
>;

export type CompositionManagerContext = {
	compositions: AnyComposition[];
	registerComposition: <
		Schema extends AnyZodObject,
		Props extends Record<string, unknown> | undefined
	>(
		comp: TComposition<Schema, Props>
	) => void;
	unregisterComposition: (name: string) => void;
	registerFolder: (name: string, parent: string | null) => void;
	unregisterFolder: (name: string, parent: string | null) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string) => void;
	setCurrentCompositionMetadata: (metadata: BaseMetadata) => void;
	currentCompositionMetadata: BaseMetadata | null;
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
	sequences: TSequence[];
	assets: TAsset[];
	folders: TFolder[];
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	registerComposition: () => undefined,
	unregisterComposition: () => undefined,
	registerFolder: () => undefined,
	unregisterFolder: () => undefined,
	currentComposition: null,
	setCurrentComposition: () => undefined,
	setCurrentCompositionMetadata: () => undefined,
	registerSequence: () => undefined,
	unregisterSequence: () => undefined,
	registerAsset: () => undefined,
	unregisterAsset: () => undefined,
	sequences: [],
	assets: [],
	folders: [],
	currentCompositionMetadata: null,
});
