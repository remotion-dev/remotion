import {createContext} from 'react';
import type {AnyZodObject} from 'zod';
import type {AnyComposition, TComposition} from './CompositionManager.js';
import type {TFolder} from './Folder.js';
import type {VideoConfig} from './video-config.js';

export type BaseMetadata = Pick<
	VideoConfig,
	'durationInFrames' | 'fps' | 'props' | 'height' | 'width'
>;

export type CanvasContent =
	| {
			type: 'composition';
	  }
	| {
			type: 'asset';
			asset: string;
	  };

export type CompositionManagerContext = {
	compositions: AnyComposition[];
	registerComposition: <
		Schema extends AnyZodObject,
		Props extends Record<string, unknown>,
	>(
		comp: TComposition<Schema, Props>,
	) => void;
	unregisterComposition: (name: string) => void;
	registerFolder: (name: string, parent: string | null) => void;
	unregisterFolder: (name: string, parent: string | null) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string | null) => void;
	setCurrentCompositionMetadata: (metadata: BaseMetadata) => void;
	currentCompositionMetadata: BaseMetadata | null;
	folders: TFolder[];
	canvasContent: CanvasContent;
	setCanvasContent: (canvasContent: CanvasContent) => void;
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
	folders: [],
	currentCompositionMetadata: null,
	canvasContent: {type: 'composition'},
	setCanvasContent: () => undefined,
});
