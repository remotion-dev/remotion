import {createContext} from 'react';

export type TComposition<T = unknown> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	component: React.LazyExoticComponent<React.ComponentType<T>>;
	props?: T;
};

export type TCompMetadata = Pick<
	TComposition,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
>;

type EnhancedTSequenceData =
	| {
			type: 'sequence';
	  }
	| {
			type: 'audio';
			src: string;
	  }
	| {
			type: 'video';
			src: string;
	  };

export type TSequence = {
	from: number;
	duration: number;
	id: string;
	displayName: string;
	parent: string | null;
	isThumbnail: boolean;
	rootId: string;
} & EnhancedTSequenceData;

export type TAsset = {
	type: 'audio' | 'video';
	src: string;
	id: string;
	sequenceFrame: number;
	volume: number;
	isRemote: boolean;
};

export type RenderAssetInfo = {
	assets: TAsset[][];
	bundleDir: string;
};

export type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: <T>(comp: TComposition<T>) => void;
	unregisterComposition: (name: string) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string) => void;
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
	sequences: TSequence[];
	assets: TAsset[];
};

export const CompositionManager = createContext<CompositionManagerContext>({
	compositions: [],
	registerComposition: () => void 0,
	unregisterComposition: () => void 0,
	currentComposition: null,
	setCurrentComposition: () => void 0,
	registerSequence: () => void 0,
	unregisterSequence: () => void 0,
	registerAsset: () => void 0,
	unregisterAsset: () => void 0,
	sequences: [],
	assets: [],
});
