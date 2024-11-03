import type {ComponentType, LazyExoticComponent} from 'react';
import React, {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {AnyZodObject} from 'zod';
import type {CalculateMetadataFunction} from './Composition.js';
import type {
	BaseMetadata,
	CanvasContent,
	CompositionManagerContext,
} from './CompositionManagerContext.js';
import {CompositionManager} from './CompositionManagerContext.js';
import type {TFolder} from './Folder.js';
import {RenderAssetManagerProvider} from './RenderAssetManager.js';
import {ResolveCompositionConfig} from './ResolveCompositionConfig.js';
import {SequenceManagerProvider} from './SequenceManager.js';
import {SharedAudioContextProvider} from './audio/shared-audio-tags.js';
import type {InferProps, PropsIfHasProps} from './props-if-has-props.js';

export type TComposition<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
> = {
	width: number | undefined;
	height: number | undefined;
	fps: number | undefined;
	durationInFrames: number | undefined;
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
	Record<string, unknown>
>;

export type TCompMetadataWithCalcFunction<
	Schema extends AnyZodObject,
	Props extends Record<string, unknown>,
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
	Props extends Record<string, unknown>,
> = Pick<
	TComposition<Schema, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames' | 'defaultProps'
>;

export type AnyCompMetadata = TCompMetadata<
	AnyZodObject,
	Record<string, unknown>
>;

export type SmallTCompMetadata<
	T extends AnyZodObject,
	Props extends Record<string, unknown>,
> = Pick<
	TComposition<T, Props>,
	'id' | 'height' | 'width' | 'fps' | 'durationInFrames'
> &
	Partial<Pick<TComposition<T, Props>, 'defaultProps'>>;

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
	stack: string | null;
	premountDisplay: number | null;
} & EnhancedTSequenceData;

export type AudioOrVideoAsset = {
	type: 'audio' | 'video';
	src: string;
	id: string;
	frame: number;
	volume: number;
	mediaFrame: number;
	playbackRate: number;
	allowAmplificationDuringRender: boolean;
	toneFrequency: number | null;
	audioStartFrame: number;
};

export type ArtifactAsset = {
	type: 'artifact';
	id: string;
	filename: string;
	content: string | Uint8Array;
	frame: number;
	binary: boolean;
};

export type TRenderAsset = AudioOrVideoAsset | ArtifactAsset;

export const compositionsRef = React.createRef<{
	getCompositions: () => AnyComposition[];
}>();

export const CompositionManagerProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly numberOfAudioTags: number;
}> = ({children, numberOfAudioTags}) => {
	// Wontfix, expected to have
	const [compositions, setCompositions] = useState<AnyComposition[]>([]);
	const currentcompositionsRef = useRef<AnyComposition[]>(compositions);
	const [folders, setFolders] = useState<TFolder[]>([]);
	const [canvasContent, setCanvasContent] = useState<CanvasContent | null>(
		null,
	);
	const [currentCompositionMetadata, setCurrentCompositionMetadata] =
		useState<BaseMetadata | null>(null);

	const updateCompositions = useCallback(
		(updateComps: (comp: AnyComposition[]) => AnyComposition[]) => {
			setCompositions((comps) => {
				const updated = updateComps(comps);
				currentcompositionsRef.current = updated;
				return updated;
			});
		},
		[],
	);

	const registerComposition = useCallback(
		<Schema extends AnyZodObject, Props extends Record<string, unknown>>(
			comp: TComposition<Schema, Props>,
		) => {
			updateCompositions((comps) => {
				if (comps.find((c) => c.id === comp.id)) {
					throw new Error(
						`Multiple composition with id ${comp.id} are registered.`,
					);
				}

				const value = [...comps, comp]
					.slice()

					.sort((a, b) => a.nonce - b.nonce) as AnyComposition[];
				return value;
			});
		},
		[updateCompositions],
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
					(p) => !(p.name === name && p.parent === parent),
				);
			});
		},
		[],
	);

	useImperativeHandle(compositionsRef, () => {
		return {
			getCompositions: () => currentcompositionsRef.current,
		};
	}, []);

	const composition = compositions.find((c) =>
		canvasContent?.type === 'composition'
			? c.id === canvasContent.compositionId
			: null,
	);

	const updateCompositionDefaultProps = useCallback(
		(id: string, newDefaultProps: Record<string, unknown>) => {
			setCompositions((comps) => {
				const updated = comps.map((c) => {
					if (c.id === id) {
						return {
							...c,
							defaultProps: newDefaultProps,
						};
					}

					return c;
				});

				return updated;
			});
		},
		[],
	);

	const contextValue = useMemo((): CompositionManagerContext => {
		return {
			compositions,
			registerComposition,
			unregisterComposition,
			folders,
			registerFolder,
			unregisterFolder,
			currentCompositionMetadata,
			setCurrentCompositionMetadata,
			canvasContent,
			setCanvasContent,
			updateCompositionDefaultProps,
		};
	}, [
		compositions,
		registerComposition,
		unregisterComposition,
		folders,
		registerFolder,
		unregisterFolder,
		currentCompositionMetadata,
		canvasContent,
		updateCompositionDefaultProps,
	]);

	return (
		<CompositionManager.Provider value={contextValue}>
			<SequenceManagerProvider>
				<RenderAssetManagerProvider>
					<ResolveCompositionConfig>
						<SharedAudioContextProvider
							numberOfAudioTags={numberOfAudioTags}
							component={composition?.component ?? null}
						>
							{children}
						</SharedAudioContextProvider>
					</ResolveCompositionConfig>
				</RenderAssetManagerProvider>
			</SequenceManagerProvider>
		</CompositionManager.Provider>
	);
};
