import type React from 'react';
import {createContext} from 'react';
import type {AnyZodObject} from 'zod';
import type {AnyComposition, TComposition} from './CompositionManager.js';
import type {TFolder} from './Folder.js';
import type {VideoConfig} from './video-config.js';

export type BaseMetadata = Pick<
	VideoConfig,
	| 'durationInFrames'
	| 'fps'
	| 'props'
	| 'height'
	| 'width'
	| 'defaultCodec'
	| 'defaultOutName'
	| 'defaultVideoImageFormat'
	| 'defaultPixelFormat'
>;

export type CanvasContent =
	| {
			type: 'composition';
			compositionId: string;
	  }
	| {
			type: 'asset';
			asset: string;
	  }
	| {
			type: 'output';
			path: string;
	  };

export type CompositionManagerSetters = {
	registerComposition: <
		Schema extends AnyZodObject,
		Props extends Record<string, unknown>,
	>(
		comp: TComposition<Schema, Props>,
	) => void;
	unregisterComposition: (name: string) => void;
	registerFolder: (name: string, parent: string | null) => void;
	unregisterFolder: (name: string, parent: string | null) => void;
	setCanvasContent: React.Dispatch<React.SetStateAction<CanvasContent | null>>;
	updateCompositionDefaultProps: (
		id: string,
		newDefaultProps: Record<string, unknown>,
	) => void;
	// This is not a setter but also a value that does not change
	onlyRenderComposition: string | null;
};

export type CompositionManagerContext = {
	compositions: AnyComposition[];
	currentCompositionMetadata: BaseMetadata | null;
	folders: TFolder[];
	canvasContent: CanvasContent | null;
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	folders: [],
	currentCompositionMetadata: null,
	canvasContent: null,
});

export const CompositionSetters = createContext<CompositionManagerSetters>({
	registerComposition: () => undefined,
	unregisterComposition: () => undefined,
	registerFolder: () => undefined,
	unregisterFolder: () => undefined,
	setCanvasContent: () => undefined,
	updateCompositionDefaultProps: () => undefined,
	onlyRenderComposition: null,
});
