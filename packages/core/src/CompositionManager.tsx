import type {ComponentType, LazyExoticComponent} from 'react';
import React, {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {AnyZodObject} from 'zod';
import {AssetManagerProvider} from './AssetManager.js';
import {SharedAudioContextProvider} from './audio/shared-audio-tags.js';
import type {CalculateMetadataFunction} from './Composition.js';
import type {
	BaseMetadata,
	CompositionManagerContext,
} from './CompositionManagerContext.js';
import {CompositionManager} from './CompositionManagerContext.js';
import type {TFolder} from './Folder.js';
import type {InferProps, PropsIfHasProps} from './props-if-has-props.js';
import {ResolveCompositionConfig} from './ResolveCompositionConfig.js';
import {SequenceManagerProvider} from './SequenceManager.js';

export type TComposition<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = {
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	id: string;
	folderName: string | null;
	parentFolderName: string | null;
	component: LazyExoticComponent<ComponentType<Props>>;
	nonce: number;
	schema: Schema | null;
	calculateMetadata: CalculateMetadataFunction<
		InferProps<Schema, Props>
	> | null;
} & PropsIfHasProps<Schema, Props>;

export type AnyComposition = TComposition<
	AnyZodObject,
	Record<string, unknown> | undefined
>;

export type TCompMetadataWithCalcFunction<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = Pick<
	TComposition<Schema, Props>,
	| 'id'
	| 'height'
	| 'width'
	| 'fps'
	| 'durationInFrames'
	| 'defaultProps'
	| 'calculateMetadata'
>;

export type TCompMetadata<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = Pick<
	TComposition<Schema, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames' | 'defaultProps'
>;

export type AnyCompMetadata = TCompMetadata<
	AnyZodObject,
	Record<string, unknown> | undefined
>;

export type SmallTCompMetadata<
	T extends AnyZodObject,
	Props extends Record<string, unknown> | undefined
> = Pick<
	TComposition<T, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
> &
	Partial<Pick<TComposition<T, Props>, 'defaultProps'>>;

export type AnySmallCompMetadata = SmallTCompMetadata<
	AnyZodObject,
	Record<string, unknown> | undefined
>;

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

export type LoopDisplay = {
	numberOfTimes: number;
	startOffset: number;
	durationInFrames: number;
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
	loopDisplay: LoopDisplay | undefined;
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

export const compositionsRef = React.createRef<{
	getCompositions: () => TCompMetadataWithCalcFunction<
		AnyZodObject,
		Record<string, unknown> | undefined
	>[];
}>();

export const CompositionManagerProvider: React.FC<{
	children: React.ReactNode;
	numberOfAudioTags: number;
}> = ({children, numberOfAudioTags}) => {
	// Wontfix, expected to have
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [compositions, setCompositions] = useState<AnyComposition[]>([]);
	const currentcompositionsRef = useRef<AnyComposition[]>(compositions);
	const [currentComposition, setCurrentComposition] = useState<string | null>(
		null
	);
	const [folders, setFolders] = useState<TFolder[]>([]);

	const [currentCompositionMetadata, setCurrentCompositionMetadata] =
		useState<BaseMetadata | null>(null);

	const updateCompositions = useCallback(
		(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			updateComps: (comp: AnyComposition[]) => AnyComposition[]
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
		<
			Schema extends AnyZodObject,
			Props extends Record<string, unknown> | undefined
		>(
			comp: TComposition<Schema, Props>
		) => {
			updateCompositions((comps) => {
				if (comps.find((c) => c.id === comp.id)) {
					throw new Error(
						`Multiple composition with id ${comp.id} are registered.`
					);
				}

				const value = [...comps, comp]
					.slice()
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.sort((a, b) => a.nonce - b.nonce) as AnyComposition[];
				return value;
			});
		},
		[updateCompositions]
	);

	const unregisterComposition = useCallback((id: string) => {
		setCompositions((comps) => {
			return comps.filter((c) => c.id !== id);
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

	useImperativeHandle(
		compositionsRef,
		() => {
			return {
				getCompositions: () => currentcompositionsRef.current,
			};
		},
		[]
	);

	const composition = compositions.find((c) => c.id === currentComposition);

	const contextValue = useMemo((): CompositionManagerContext => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
			currentComposition,
			setCurrentComposition,
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
		folders,
		registerFolder,
		unregisterFolder,
		currentCompositionMetadata,
	]);

	return (
		<CompositionManager.Provider value={contextValue}>
			<SequenceManagerProvider>
				<AssetManagerProvider>
					<ResolveCompositionConfig>
						<SharedAudioContextProvider
							numberOfAudioTags={numberOfAudioTags}
							component={composition?.component ?? null}
						>
							{children}
						</SharedAudioContextProvider>
					</ResolveCompositionConfig>
				</AssetManagerProvider>
			</SequenceManagerProvider>
		</CompositionManager.Provider>
	);
};
