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
import type {AnyZodObject} from 'zod';
import type {CalculateMetadataFunction} from './Composition.js';
import type {AnyComposition} from './CompositionManager.js';
import {CompositionManager} from './CompositionManagerContext.js';
import {EditorPropsContext} from './EditorProps.js';
import {getInputProps} from './config/input-props.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {NonceContext} from './nonce.js';
import type {InferProps} from './props-if-has-props.js';
import {resolveVideoConfigOrCatch} from './resolve-video-config.js';
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

export const PROPS_UPDATED_EXTERNALLY = 'remotion.propsUpdatedExternally';

export const ResolveCompositionConfig: React.FC<
	PropsWithChildren<{
		children: React.ReactNode;
	}>
> = ({children}) => {
	const [currentRenderModalComposition, setCurrentRenderModalComposition] =
		useState<string | null>(null);
	const {compositions, canvasContent, currentCompositionMetadata} =
		useContext(CompositionManager);
	const {fastRefreshes} = useContext(NonceContext);
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
			: (getInputProps() ?? {});
	}, []);

	const [resolvedConfigs, setResolvedConfigs] = useState<
		Record<string, VideoConfigState | undefined>
	>({});

	const selectedEditorProps = useMemo(() => {
		return selectedComposition
			? (allEditorProps[selectedComposition.id] ?? {})
			: {};
	}, [allEditorProps, selectedComposition]);

	const renderModalProps = useMemo(() => {
		return renderModalComposition
			? (allEditorProps[renderModalComposition.id] ?? {})
			: {};
	}, [allEditorProps, renderModalComposition]);

	const hasResolution = Boolean(currentCompositionMetadata);

	const doResolution = useCallback(
		({
			calculateMetadata,
			combinedProps,
			compositionDurationInFrames,
			compositionFps,
			compositionHeight,
			compositionId,
			compositionWidth,
			defaultProps,
		}: {
			compositionId: string;
			calculateMetadata: CalculateMetadataFunction<
				InferProps<AnyZodObject, Record<string, unknown>>
			> | null;
			compositionWidth: number | null;
			compositionHeight: number | null;
			compositionFps: number | null;
			compositionDurationInFrames: number | null;
			defaultProps: Record<string, unknown>;
			combinedProps: Record<string, unknown>;
		}) => {
			const controller = new AbortController();
			if (hasResolution) {
				return controller;
			}

			const {signal} = controller;

			const result = resolveVideoConfigOrCatch({
				compositionId,
				calculateMetadata,
				originalProps: combinedProps,
				signal,
				defaultProps,
				compositionDurationInFrames,
				compositionFps,
				compositionHeight,
				compositionWidth,
			});
			if (result.type === 'error') {
				setResolvedConfigs((r) => ({
					...r,
					[compositionId]: {
						type: 'error',
						error: result.error,
					},
				}));

				return controller;
			}

			const promOrNot = result.result;

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
		[hasResolution],
	);

	const currentComposition =
		canvasContent?.type === 'composition' ? canvasContent.compositionId : null;

	useImperativeHandle(resolveCompositionsRef, () => {
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
					...defaultProps,
					...(inputProps ?? {}),
				};

				doResolution({
					defaultProps,
					calculateMetadata: composition.calculateMetadata,
					combinedProps: props,
					compositionDurationInFrames: composition.durationInFrames ?? null,
					compositionFps: composition.fps ?? null,
					compositionHeight: composition.height ?? null,
					compositionWidth: composition.width ?? null,
					compositionId: composition.id,
				});
			},
		};
	}, [
		allEditorProps,
		compositions,
		currentComposition,
		doResolution,
		inputProps,
	]);

	const isTheSame = selectedComposition?.id === renderModalComposition?.id;

	const currentDefaultProps = useMemo(() => {
		return {
			...(selectedComposition?.defaultProps ?? {}),
			...(selectedEditorProps ?? {}),
		};
	}, [selectedComposition?.defaultProps, selectedEditorProps]);

	const originalProps = useMemo(() => {
		return {
			...currentDefaultProps,
			...(inputProps ?? {}),
		};
	}, [currentDefaultProps, inputProps]);

	const canResolve =
		selectedComposition && needsResolution(selectedComposition);

	const shouldIgnoreUpdate =
		typeof window !== 'undefined' &&
		window.remotion_ignoreFastRefreshUpdate &&
		fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;

	useEffect(() => {
		if (shouldIgnoreUpdate) {
			// We already have the current state, we just saved it back
			// to the file
			return;
		}

		if (canResolve) {
			const controller = doResolution({
				calculateMetadata: selectedComposition.calculateMetadata,
				combinedProps: originalProps,
				compositionDurationInFrames:
					selectedComposition.durationInFrames ?? null,
				compositionFps: selectedComposition.fps ?? null,
				compositionHeight: selectedComposition.height ?? null,
				compositionWidth: selectedComposition.width ?? null,
				defaultProps: currentDefaultProps,
				compositionId: selectedComposition.id,
			});

			return () => {
				controller.abort();
			};
		}
	}, [
		canResolve,
		currentDefaultProps,
		doResolution,
		originalProps,
		selectedComposition?.calculateMetadata,
		selectedComposition?.durationInFrames,
		selectedComposition?.fps,
		selectedComposition?.height,
		selectedComposition?.id,
		selectedComposition?.width,
		shouldIgnoreUpdate,
	]);

	useEffect(() => {
		if (shouldIgnoreUpdate) {
			// We already have the current state, we just saved it back
			// to the file
			return;
		}

		window.dispatchEvent(
			new CustomEvent<{resetUnsaved: boolean}>(PROPS_UPDATED_EXTERNALLY, {
				detail: {
					resetUnsaved: true,
				},
			}),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fastRefreshes]);

	useEffect(() => {
		if (renderModalComposition && !isTheSame) {
			const combinedProps = {
				...(renderModalComposition.defaultProps ?? {}),
				...(renderModalProps ?? {}),
				...(inputProps ?? {}),
			};

			const controller = doResolution({
				calculateMetadata: renderModalComposition.calculateMetadata,
				compositionDurationInFrames:
					renderModalComposition.durationInFrames ?? null,
				compositionFps: renderModalComposition.fps ?? null,
				compositionHeight: renderModalComposition.height ?? null,
				compositionId: renderModalComposition.id,
				compositionWidth: renderModalComposition.width ?? null,
				defaultProps: currentDefaultProps,
				combinedProps,
			});

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
		return composition ? (allEditorProps[composition.id] ?? {}) : {};
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
					defaultOutName: currentCompositionMetadata.defaultOutName,
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
							: (getInputProps() ?? {})),
					},
					defaultCodec: null,
					defaultOutName: null,
				},
			};
		}

		if (!context[composition.id]) {
			return null;
		}

		return context[composition.id] as VideoConfigState;
	}, [composition, context, currentCompositionMetadata, selectedEditorProps]);
};
