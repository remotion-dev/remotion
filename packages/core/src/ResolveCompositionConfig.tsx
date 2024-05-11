import type {PropsWithChildren} from 'react';
import {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import type {AnyZodObject} from 'zod';
import type {CalculateMetadataFunction} from './Composition.js';
import type {AnyComposition} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {EditorPropsContext} from './EditorProps.js';
import {getInputProps} from './config/input-props.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import type {InferProps} from './props-if-has-props.js';
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

	const inputProps = useMemo(() => {
		return typeof window === 'undefined' || getRemotionEnvironment().isPlayer
			? {}
			: getInputProps() ?? {};
	}, []);

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
		(
			compositionId: string,
			calculateMetadata: CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			> | null,
			defaultProps: Record<string, unknown>,
			combinedProps: Record<string, unknown>,
		) => {
			const controller = new AbortController();
			if (currentCompositionMetadata) {
				return controller;
			}

			const {signal} = controller;

			const promOrNot = resolveVideoConfig({
				compositionId,
				calculateMetadata: selectedComposition?.calculateMetadata ?? null,
				originalProps: combinedProps,
				signal,
				defaultProps,
			});

			if (typeof promOrNot === 'object' && 'then' in promOrNot) {
				setResolvedConfigs((r) => {
					const prev = r[compositionId];
					if (
						prev?.type === 'success' ||
						prev?.type === 'success-and-refreshing'
					) {
						return {
							...r,
							[compositionId]: {
								type: 'success-and-refreshing',
								result: prev.result,
							},
						};
					}

					return {
						...r,
						[compositionId]: {
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
							[compositionId]: {
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
							[compositionId]: {
								type: 'error',
								error: err,
							},
						}));
					});
			} else {
				setResolvedConfigs((r) => ({
					...r,
					[compositionId]: {
						type: 'success',
						result: promOrNot,
					},
				}));
			}

			return controller;
		},
		[currentCompositionMetadata, selectedComposition?.calculateMetadata],
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

					const defaultProps = {
						...(composition.defaultProps ?? {}),
						...(editorProps ?? {}),
					};

					const props = {
						...(inputProps ?? {}),
					};

					doResolution(composition, defaultProps, props);
				},
			};
		},
		[
			allEditorProps,
			compositions,
			currentComposition,
			doResolution,
			inputProps,
		],
	);

	const isTheSame = selectedComposition?.id === renderModalComposition?.id;

	const lastDefaultProps = useRef({});
	const currentDefaultProps = useMemo(() => {
		const newDefaultProps = {
			...(selectedComposition?.defaultProps ?? {}),
			...(selectedEditorProps ?? {}),
		};

		if (
			JSON.stringify(lastDefaultProps.current) ===
			JSON.stringify(newDefaultProps)
		) {
			return lastDefaultProps.current;
		}

		lastDefaultProps.current = newDefaultProps;
		return newDefaultProps;
	}, [selectedComposition?.defaultProps, selectedEditorProps]);

	const lastOriginalProps = useRef({});
	const originalProps = useMemo(() => {
		const newOriginalProps = {
			...currentDefaultProps,
			...(inputProps ?? {}),
		};

		if (
			JSON.stringify(lastOriginalProps.current) ===
			JSON.stringify(newOriginalProps)
		) {
			return lastOriginalProps.current;
		}

		lastOriginalProps.current = newOriginalProps;
		return newOriginalProps;
	}, [currentDefaultProps, inputProps]);

	useEffect(() => {
		if (selectedComposition && needsResolution(selectedComposition)) {
			const controller = doResolution(
				selectedComposition,
				currentDefaultProps,
				originalProps,
			);

			return () => {
				controller.abort();
			};
		}
	}, [currentDefaultProps, doResolution, originalProps, selectedComposition]);

	useEffect(() => {
		if (renderModalComposition && !isTheSame) {
			const combinedProps = {
				...(renderModalComposition.defaultProps ?? {}),
				...(renderModalProps ?? {}),
				...(inputProps ?? {}),
			};

			const controller = doResolution(
				renderModalComposition,
				currentDefaultProps,
				combinedProps,
			);

			return () => {
				controller.abort();
			};
		}
	}, [
		currentDefaultProps,
		doResolution,
		inputProps,
		isTheSame,
		renderModalComposition,
		renderModalProps,
	]);

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
