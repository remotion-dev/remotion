import type {PropsWithChildren} from 'react';
import {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import type {AnyComposition} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {getInputProps} from './config/input-props.js';
import {EditorPropsContext} from './EditorProps.js';
import {getRemotionEnvironment} from './get-environment.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import type {VideoConfig} from './video-config.js';

type ResolveCompositionConfigContect = Record<
	string,
	VideoConfigState | undefined
>;

export const ResolveCompositionContext =
	createContext<ResolveCompositionConfigContect | null>(null);

export const resolveCompositionsRef = createRef<{
	setCurrentRenderModalComposition: (compositionId: string | null) => void;
	reloadCurrentlySelectedComposition: () => void;
}>();

type VideoConfigState =
	| {
			type: 'loading';
	  }
	| {
			type: 'success';
			result: VideoConfig;
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const ResolveCompositionConfig: React.FC<
	PropsWithChildren<{
		children: React.ReactNode;
	}>
> = ({children}) => {
	const [currentRenderModalComposition, setCurrentRenderModalComposition] =
		useState<string | null>(null);
	const {compositions, currentComposition, currentCompositionMetadata} =
		useContext(CompositionManager);
	const selectedComposition = compositions.find(
		(c) => c.id === currentComposition
	);
	const renderModalComposition = compositions.find(
		(c) => c.id === currentRenderModalComposition
	);
	const {props: allEditorProps} = useContext(EditorPropsContext);

	const [resolvedConfigs, setResolvedConfigs] = useState<
		Record<string, VideoConfigState | undefined>
	>({});

	const selectedEditorProps = useMemo(() => {
		return selectedComposition
			? allEditorProps[selectedComposition.id] ?? {}
			: {};
	}, [allEditorProps, selectedComposition]);

	const renderModalProps = useMemo(() => {
		return renderModalComposition
			? allEditorProps[renderModalComposition.id] ?? {}
			: {};
	}, [allEditorProps, renderModalComposition]);

	const doResolution = useCallback(
		(composition: AnyComposition, editorProps: object) => {
			const controller = new AbortController();
			if (currentCompositionMetadata) {
				return controller;
			}

			const {signal} = controller;

			const promOrNot = resolveVideoConfig({composition, editorProps, signal});

			if (typeof promOrNot === 'object' && 'then' in promOrNot) {
				setResolvedConfigs((r) => ({
					...r,
					[composition.id]: {
						type: 'loading',
					},
				}));
				promOrNot
					.then((c) => {
						if (controller.signal.aborted) {
							return;
						}

						setResolvedConfigs((r) => ({
							...r,
							[composition.id]: {
								type: 'success',
								result: c,
							},
						}));
					})
					.catch((err) => {
						if (controller.signal.aborted) {
							return;
						}

						setResolvedConfigs((r) => ({
							...r,
							[composition.id]: {
								type: 'error',
								error: err,
							},
						}));
					});
			} else {
				setResolvedConfigs((r) => ({
					...r,
					[composition.id]: {
						type: 'success',
						result: promOrNot,
					},
				}));
			}

			return controller;
		},
		[currentCompositionMetadata]
	);

	useImperativeHandle(
		resolveCompositionsRef,
		() => {
			return {
				setCurrentRenderModalComposition: (id: string | null) => {
					setCurrentRenderModalComposition(id);
				},
				reloadCurrentlySelectedComposition: () => {
					if (!currentComposition) {
						return;
					}

					const composition = compositions.find(
						(c) => c.id === currentComposition
					);

					if (!composition) {
						throw new Error(
							`Could not find composition with id ${currentComposition}`
						);
					}

					const editorProps = allEditorProps[currentComposition] ?? {};

					doResolution(composition, editorProps);
				},
			};
		},
		[allEditorProps, compositions, currentComposition, doResolution]
	);

	const isTheSame = selectedComposition?.id === renderModalComposition?.id;

	useEffect(() => {
		if (selectedComposition && needsResolution(selectedComposition)) {
			const controller = doResolution(selectedComposition, selectedEditorProps);
			return () => {
				controller.abort();
			};
		}
	}, [doResolution, selectedComposition, selectedEditorProps]);

	useEffect(() => {
		if (renderModalComposition && !isTheSame) {
			const controller = doResolution(renderModalComposition, renderModalProps);

			return () => {
				controller.abort();
			};
		}
	}, [doResolution, isTheSame, renderModalComposition, renderModalProps]);

	const resolvedConfigsIncludingStaticOnes = useMemo(() => {
		const staticComps = compositions.filter((c) => {
			return c.calculateMetadata === null;
		});
		return {
			...resolvedConfigs,
			...staticComps.reduce((acc, curr) => {
				return {
					...acc,
					[curr.id]: {
						type: 'success',
						result: {...curr, defaultProps: curr.defaultProps ?? {}},
					},
				};
			}, {}),
		};
	}, [compositions, resolvedConfigs]);

	return (
		<ResolveCompositionContext.Provider
			value={resolvedConfigsIncludingStaticOnes}
		>
			{children}
		</ResolveCompositionContext.Provider>
	);
};

export const needsResolution = (composition: AnyComposition) => {
	return Boolean(composition.calculateMetadata);
};

export const useResolvedVideoConfig = (
	preferredCompositionId: string | null
): VideoConfigState | null => {
	const context = useContext(
		ResolveCompositionContext
	) as ResolveCompositionConfigContect;
	const {props: allEditorProps} = useContext(EditorPropsContext);

	const {compositions, currentComposition, currentCompositionMetadata} =
		useContext(CompositionManager);
	const compositionId = preferredCompositionId ?? currentComposition;
	const composition = compositions.find((c) => c.id === compositionId);

	const selectedEditorProps = useMemo(() => {
		return composition ? allEditorProps[composition.id] ?? {} : {};
	}, [allEditorProps, composition]);

	return useMemo(() => {
		if (!composition) {
			return null;
		}

		if (currentCompositionMetadata) {
			return {
				type: 'success',
				result: {
					...currentCompositionMetadata,
					id: composition.id,
					defaultProps: currentCompositionMetadata.defaultProps ?? {},
				},
			};
		}

		if (!needsResolution(composition)) {
			return {
				type: 'success',
				result: {
					...composition,
					defaultProps: {
						...(composition.defaultProps ?? {}),
						...(selectedEditorProps ?? {}),
						...(typeof window === 'undefined' ||
						getRemotionEnvironment() === 'player-development' ||
						getRemotionEnvironment() === 'player-production'
							? {}
							: getInputProps() ?? {}),
					},
				},
			};
		}

		if (!context[composition.id]) {
			return null;
		}

		return context[composition.id] as VideoConfigState;
	}, [composition, context, currentCompositionMetadata, selectedEditorProps]);
};
