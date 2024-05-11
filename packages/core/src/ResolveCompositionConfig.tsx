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
import {EditorPropsContext} from './EditorProps.js';
import {getInputProps} from './config/input-props.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {resolveVideoConfig} from './resolve-video-config.js';
import {validateDimension} from './validation/validate-dimensions.js';
import {validateDurationInFrames} from './validation/validate-duration-in-frames.js';
import {validateFps} from './validation/validate-fps.js';
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
			type: 'success-and-refreshing';
			result: VideoConfig;
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const needsResolution = (composition: AnyComposition) => {
	return Boolean(composition.calculateMetadata);
};

export const ResolveCompositionConfig: React.FC<
	PropsWithChildren<{
		children: React.ReactNode;
	}>
> = ({children}) => {
	const [currentRenderModalComposition, setCurrentRenderModalComposition] =
		useState<string | null>(null);
	const {compositions, canvasContent, currentCompositionMetadata} =
		useContext(CompositionManager);
	const selectedComposition = useMemo(() => {
		return compositions.find(
			(c) =>
				canvasContent &&
				canvasContent.type === 'composition' &&
				canvasContent.compositionId === c.id,
		);
	}, [canvasContent, compositions]);

	const renderModalComposition = compositions.find(
		(c) => c.id === currentRenderModalComposition,
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

			const inputProps =
				typeof window === 'undefined' || getRemotionEnvironment().isPlayer
					? {}
					: getInputProps() ?? {};

			const {signal} = controller;

			const originalProps = {
				...(composition.defaultProps ?? {}),
				...(editorProps ?? {}),
				...(inputProps ?? {}),
			};

			const promOrNot = resolveVideoConfig({
				composition,
				originalProps,
				signal,
			});

			if (typeof promOrNot === 'object' && 'then' in promOrNot) {
				setResolvedConfigs((r) => {
					const prev = r[composition.id];
					if (
						prev?.type === 'success' ||
						prev?.type === 'success-and-refreshing'
					) {
						return {
							...r,
							[composition.id]: {
								type: 'success-and-refreshing',
								result: prev.result,
							},
						};
					}

					return {
						...r,
						[composition.id]: {
							type: 'loading',
						},
					};
				});
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
		[currentCompositionMetadata],
	);

	const currentComposition =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;

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
						(c) => c.id === currentComposition,
					);

					if (!composition) {
						throw new Error(
							`Could not find composition with id ${currentComposition}`,
						);
					}

					const editorProps = allEditorProps[currentComposition] ?? {};

					doResolution(composition, editorProps);
				},
			};
		},
		[allEditorProps, compositions, currentComposition, doResolution],
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

export const useResolvedVideoConfig = (
	preferredCompositionId: string | null,
): VideoConfigState | null => {
	const context = useContext(
		ResolveCompositionContext,
	) as ResolveCompositionConfigContect;
	const {props: allEditorProps} = useContext(EditorPropsContext);

	const {compositions, canvasContent, currentCompositionMetadata} =
		useContext(CompositionManager);
	const currentComposition =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;
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
					props: currentCompositionMetadata.props,
					defaultProps: composition.defaultProps ?? {},
					defaultCodec: currentCompositionMetadata.defaultCodec,
				},
			};
		}

		if (!needsResolution(composition)) {
			validateDurationInFrames(composition.durationInFrames, {
				allowFloats: false,
				component: `in <Composition id="${composition.id}">`,
			});
			validateFps(
				composition.fps,
				`in <Composition id="${composition.id}">`,
				false,
			);
			validateDimension(
				composition.width,
				'width',
				`in <Composition id="${composition.id}">`,
			);
			validateDimension(
				composition.height,
				'height',
				`in <Composition id="${composition.id}">`,
			);
			return {
				type: 'success',
				result: {
					width: composition.width as number,
					height: composition.height as number,
					fps: composition.fps as number,
					id: composition.id,
					durationInFrames: composition.durationInFrames as number,
					defaultProps: composition.defaultProps ?? {},
					props: {
						...(composition.defaultProps ?? {}),
						...(selectedEditorProps ?? {}),
						...(typeof window === 'undefined' ||
						getRemotionEnvironment().isPlayer
							? {}
							: getInputProps() ?? {}),
					},
					defaultCodec: null,
				},
			};
		}

		if (!context[composition.id]) {
			return null;
		}

		return context[composition.id] as VideoConfigState;
	}, [composition, context, currentCompositionMetadata, selectedEditorProps]);
};
