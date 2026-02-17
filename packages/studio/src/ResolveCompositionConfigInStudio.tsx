import type {PropsWithChildren} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {getInputProps, Internals} from 'remotion';
import {FastRefreshContext} from './fast-refresh-context';

type VideoConfigState =
	| {
			type: 'loading';
	  }
	| {
			type: 'success';
			result: Record<string, unknown>;
	  }
	| {
			type: 'success-and-refreshing';
			result: Record<string, unknown>;
	  }
	| {
			type: 'error';
			error: Error;
	  };

export const ResolveCompositionConfigInStudio: React.FC<
	PropsWithChildren<{
		readonly children: React.ReactNode;
	}>
> = ({children}) => {
	const [currentRenderModalComposition, setCurrentRenderModalComposition] =
		useState<string | null>(null);
	const {compositions, canvasContent, currentCompositionMetadata} = useContext(
		Internals.CompositionManager,
	);
	const {fastRefreshes, manualRefreshes} = useContext(FastRefreshContext);

	// don't do anything, this component should should re-render if the value changes
	if (manualRefreshes) {
		/** */
	}

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
	const {props: allEditorProps} = useContext(Internals.EditorPropsContext);
	const env = Internals.getRemotionEnvironment();

	const inputProps = useMemo(() => {
		return typeof window === 'undefined' || env.isPlayer
			? {}
			: (getInputProps() ?? {});
	}, [env.isPlayer]);

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
			calculateMetadata: unknown;
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

			const result = Internals.resolveVideoConfigOrCatch({
				compositionId,
				calculateMetadata: calculateMetadata as Parameters<
					typeof Internals.resolveVideoConfigOrCatch
				>[0]['calculateMetadata'],
				inputProps: combinedProps,
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

	useImperativeHandle(
		Internals.resolveCompositionsRef,
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
		selectedComposition && Boolean(selectedComposition.calculateMetadata);

	const shouldIgnoreUpdate =
		typeof window !== 'undefined' &&
		window.remotion_ignoreFastRefreshUpdate &&
		fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;

	useEffect(() => {
		if (shouldIgnoreUpdate) {
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
		<Internals.ResolveCompositionContext.Provider
			value={resolvedConfigsIncludingStaticOnes}
		>
			{children}
		</Internals.ResolveCompositionContext.Provider>
	);
};
