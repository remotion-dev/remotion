import type {ComponentType, LazyExoticComponent} from 'react';
import React, {
	createContext,
	useCallback,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {z} from 'zod';
import type {TFolder} from './Folder.js';

export type TComposition<T extends z.ZodTypeAny, Props> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	folderName: string | null;
	parentFolderName: string | null;
	component: LazyExoticComponent<ComponentType<Props>>;
	defaultProps: (z.infer<T> & Props) | undefined;
	nonce: number;
};

export type AnyComposition = TComposition<z.ZodTypeAny, unknown>;

export type TCompMetadata<Schema extends z.ZodTypeAny, Props> = Pick<
	TComposition<Schema, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames' | 'defaultProps'
>;

export type AnyCompMetadata = TCompMetadata<z.ZodTypeAny, unknown>;

export type SmallTCompMetadata<T extends z.ZodTypeAny, Props> = Pick<
	TComposition<T, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
> &
	Partial<Pick<TComposition<T, Props>, 'defaultProps'>>;

export type AnySmallCompMetadata = SmallTCompMetadata<z.ZodTypeAny, unknown>;

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
	AnyCompMetadata,
	'durationInFrames' | 'fps' | 'defaultProps' | 'height' | 'width'
>;

export type CompositionManagerContext = {
	compositions: AnyComposition[];
	registerComposition: <T extends z.ZodTypeAny, Props>(
		comp: TComposition<T, Props>
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

export const compositionsRef = React.createRef<{
	getCompositions: () => TCompMetadata<z.ZodTypeAny, unknown>[];
}>();

export const CompositionManagerProvider: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	// Wontfix, expected to have
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [compositions, setCompositions] = useState<TComposition<any, any>[]>(
		[]
	);
	const currentcompositionsRef = useRef<AnyComposition[]>(compositions);
	const [currentComposition, setCurrentComposition] = useState<string | null>(
		null
	);
	const [assets, setAssets] = useState<TAsset[]>([]);
	const [folders, setFolders] = useState<TFolder[]>([]);

	const [sequences, setSequences] = useState<TSequence[]>([]);

	const [currentCompositionMetadata, setCurrentCompositionMetadata] =
		useState<BaseMetadata | null>(null);

	const updateCompositions = useCallback(
		(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			updateComps: (comp: TComposition<any, any>[]) => TComposition<any, any>[]
		) => {
			setCompositions((comps) => {
				const updated = updateComps(comps);
				currentcompositionsRef.current = updated;
				return updated;
			});
		},
		[]
	);

	const registerComposition = useCallback(
		<Schema extends z.ZodTypeAny, Props>(comp: TComposition<Schema, Props>) => {
			updateCompositions((comps) => {
				if (comps.find((c) => c.id === comp.id)) {
					throw new Error(
						`Multiple composition with id ${comp.id} are registered.`
					);
				}

				return [...comps, comp].slice().sort((a, b) => a.nonce - b.nonce);
			});
		},
		[updateCompositions]
	);

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

	useImperativeHandle(
		compositionsRef,
		() => {
			return {
				getCompositions: () => currentcompositionsRef.current,
			};
		},
		[]
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
	]);

	return (
		<CompositionManager.Provider value={contextValue}>
			{children}
		</CompositionManager.Provider>
	);
};
