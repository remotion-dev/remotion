import type {ComponentType, LazyExoticComponent} from 'react';
import React, {
	createContext,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import type {TFolder} from './Folder';

export type TComposition<T = unknown> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	folderName: string | null;
	parentFolderName: string | null;
	component: LazyExoticComponent<ComponentType<T>>;
	defaultProps: T | undefined;
	nonce: number;
};

export type TCompMetadata = Pick<
	TComposition,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames' | 'defaultProps'
>;

export type SmallTCompMetadata = Pick<
	TComposition,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
> &
	Partial<Pick<TComposition, 'defaultProps'>>;

type EnhancedTSequenceData =
	| {
			type: 'sequence';
	  }
	| {
			type: 'audio';
			src: string;
			// Volume is represented as a comma separated list - if it's a string
			// React can more efficiently update and will not rerender if anonymous functions
			// are passed.
			// If not a function was passed, a number is being used
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
			playbackRate: number;
	  }
	| {
			type: 'video';
			src: string;
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
			playbackRate: number;
	  };

export type TSequence = {
	from: number;
	duration: number;
	id: string;
	displayName: string;
	parent: string | null;
	rootId: string;
	showInTimeline: boolean;
	nonce: number;
	showLoopTimesInTimeline: number | undefined;
} & EnhancedTSequenceData;

export type TAsset = {
	type: 'audio' | 'video';
	src: string;
	id: string;
	frame: number;
	volume: number;
	mediaFrame: number;
	playbackRate: number;
	allowAmplificationDuringRender: boolean;
};

type BaseMetadata = Pick<
	TCompMetadata,
	'durationInFrames' | 'fps' | 'defaultProps' | 'height' | 'width'
>;

export type ClipRegion = {
	x: number;
	y: number;
	width: number;
	height: number;
	hide: boolean;
};

export type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: <T>(comp: TComposition<T>) => void;
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
	setClipRegion: (clip: ClipRegion | null) => void;
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
	setClipRegion: () => null,
});

export const compositionsRef = React.createRef<{
	getCompositions: () => TCompMetadata[];
}>();

export const CompositionManagerProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	// Wontfix, expected to have
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [compositions, setCompositions] = useState<TComposition<any>[]>([]);
	const [currentComposition, setCurrentComposition] = useState<string | null>(
		null
	);
	const [assets, setAssets] = useState<TAsset[]>([]);
	const [folders, setFolders] = useState<TFolder[]>([]);

	const [sequences, setSequences] = useState<TSequence[]>([]);
	const [clipRegion, setRegion] = useState<ClipRegion | null>(null);

	const [currentCompositionMetadata, setCurrentCompositionMetadata] =
		useState<BaseMetadata | null>(null);

	const registerComposition = useCallback(<T,>(comp: TComposition<T>) => {
		setCompositions((comps) => {
			if (comps.find((c) => c.id === comp.id)) {
				throw new Error(
					`Multiple composition with id ${comp.id} are registered.`
				);
			}

			return [...comps, comp].slice().sort((a, b) => a.nonce - b.nonce);
		});
	}, []);

	const registerSequence = useCallback((seq: TSequence) => {
		setSequences((seqs) => {
			return [...seqs, seq];
		});
	}, []);

	const unregisterComposition = useCallback((id: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.id !== id);
		});
	}, []);

	const unregisterSequence = useCallback((seq: string) => {
		setSequences((seqs) => seqs.filter((s) => s.id !== seq));
	}, []);

	const registerAsset = useCallback((asset: TAsset) => {
		setAssets((assts) => {
			return [...assts, asset];
		});
	}, []);

	const setClipRegion = useCallback((region: ClipRegion | null) => {
		setRegion(region);
	}, []);

	const unregisterAsset = useCallback((id: string) => {
		setAssets((assts) => {
			return assts.filter((a) => a.id !== id);
		});
	}, []);

	const registerFolder = useCallback((name: string, parent: string | null) => {
		setFolders((prevFolders) => {
			return [
				...prevFolders,
				{
					name,
					parent,
				},
			];
		});
	}, []);

	const unregisterFolder = useCallback(
		(name: string, parent: string | null) => {
			setFolders((prevFolders) => {
				return prevFolders.filter(
					(p) => !(p.name === name && p.parent === parent)
				);
			});
		},
		[]
	);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectAssets = () => {
				setAssets([]); // clear assets at next render
				return assets;
			};

			window.remotion_getClipRegion = () => {
				setClipRegion(null); // clear assets at next render
				return clipRegion;
			};
		}
	}, [assets, clipRegion, setClipRegion]);

	useImperativeHandle(
		compositionsRef,
		() => {
			return {
				getCompositions: () => compositions,
			};
		},
		[compositions]
	);

	const contextValue = useMemo((): CompositionManagerContext => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
			currentComposition,
			setCurrentComposition,
			registerSequence,
			unregisterSequence,
			registerAsset,
			unregisterAsset,
			sequences,
			assets,
			folders,
			registerFolder,
			unregisterFolder,
			currentCompositionMetadata,
			setCurrentCompositionMetadata,
			setClipRegion,
		};
	}, [
		compositions,
		registerComposition,
		unregisterComposition,
		currentComposition,
		registerSequence,
		unregisterSequence,
		registerAsset,
		unregisterAsset,
		sequences,
		assets,
		folders,
		registerFolder,
		unregisterFolder,
		currentCompositionMetadata,
		setClipRegion,
	]);

	return (
		<CompositionManager.Provider value={contextValue}>
			{children}
		</CompositionManager.Provider>
	);
};
