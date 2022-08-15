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
	  }
	| {
			type: 'video';
			src: string;
			volume: string | number;
			doesVolumeChange: boolean;
			startMediaFrom: number;
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
};

export type TCaption = {
	id: string;
	language?: string;
	src: string;
	title?: string;
};

export type RenderAssetInfo = {
	assets: TAsset[][];
	captions: TCaption[][];
	bundleDir: string;
};

export type CompositionManagerContext = {
	compositions: TComposition[];
	registerComposition: <T>(comp: TComposition<T>) => void;
	unregisterComposition: (name: string) => void;
	registerFolder: (name: string, parent: string | null) => void;
	unregisterFolder: (name: string, parent: string | null) => void;
	currentComposition: string | null;
	setCurrentComposition: (curr: string) => void;
	registerSequence: (seq: TSequence) => void;
	unregisterSequence: (id: string) => void;
	registerAsset: (asset: TAsset) => void;
	unregisterAsset: (id: string) => void;
	registerCaption: (caption: TCaption) => void;
	unregisterCaption: (id: string) => void;
	sequences: TSequence[];
	assets: TAsset[];
	captions: TCaption[];
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
	registerSequence: () => undefined,
	unregisterSequence: () => undefined,
	registerAsset: () => undefined,
	unregisterAsset: () => undefined,
	registerCaption: () => undefined,
	unregisterCaption: () => undefined,
	sequences: [],
	assets: [],
	captions: [],
	folders: [],
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
	const [captions, setCaptions] = useState<TCaption[]>([]);

	const [sequences, setSequences] = useState<TSequence[]>([]);

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
		}
	}, [assets]);

	useLayoutEffect(() => {
		if (typeof window !== 'undefined') {
			window.remotion_collectCaptions = () => {
				setCaptions([]); // clear captions at next render
				return captions;
			};
		}
	}, [captions]);

	useImperativeHandle(
		compositionsRef,
		() => {
			return {
				getCompositions: () => compositions,
			};
		},
		[compositions]
	);

	const registerCaption = useCallback((caption: TCaption) => {
		setCaptions((capts) => capts.concat(caption));
	}, []);
	const unregisterCaption = useCallback((id: string) => {
		setCaptions((capts) => capts.filter((a) => a.id !== id));
	}, []);

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
			registerCaption,
			unregisterCaption,
			captions: [],
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
		registerCaption,
		unregisterCaption,
	]);

	return (
		<CompositionManager.Provider value={contextValue}>
			{children}
		</CompositionManager.Provider>
	);
};
