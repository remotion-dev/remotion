import type {FC, PropsWithChildren} from 'react';
import React, {useCallback, useMemo, useRef} from 'react';
import type {
	AbsoluteFillLayout,
	LayoutAndStyle,
	SequenceControls,
	SequencePropsWithoutDuration,
	InteractivitySchema,
} from 'remotion';
import {
	Internals,
	Interactive,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	WrapInEnteringProgressContext,
	WrapInExitingProgressContext,
} from './context.js';
import {flattenChildren} from './flatten-children.js';
import {slide} from './presentations/slide.js';
import type {
	TransitionSeriesOverlayProps,
	TransitionSeriesTransitionProps,
} from './types.js';
import {validateDurationInFrames} from './validate.js';

const {SequenceWithoutSchema} = Internals;

type ResolvedTransitionSeriesTransitionProps<
	PresentationProps extends Record<string, unknown>,
> = TransitionSeriesTransitionProps<PresentationProps> & {
	readonly controls: SequenceControls | null | undefined;
	readonly stack: string | null;
};

type InternalTransitionSeriesTransitionProps<
	PresentationProps extends Record<string, unknown>,
> = ResolvedTransitionSeriesTransitionProps<PresentationProps> & {
	readonly _remotionInternalRender:
		| ((
				props: ResolvedTransitionSeriesTransitionProps<PresentationProps>,
		  ) => React.ReactNode)
		| null;
};

const TransitionSeriesTransitionInner = <
	PresentationProps extends Record<string, unknown>,
>({
	stack = null,
	_remotionInternalRender = null,
	...props
}: InternalTransitionSeriesTransitionProps<PresentationProps>) => {
	if (_remotionInternalRender) {
		return _remotionInternalRender({...props, stack});
	}

	return null;
};

type TransitionSeriesTransitionComponent = <
	PresentationProps extends Record<string, unknown>,
>(
	props: TransitionSeriesTransitionProps<PresentationProps>,
) => React.ReactNode;

const transitionSeriesTransitionSchema = {} satisfies InteractivitySchema;

const TransitionSeriesTransition = Interactive.withSchema({
	Component: TransitionSeriesTransitionInner as unknown as React.ComponentType<
		TransitionSeriesTransitionProps<Record<string, unknown>> & {
			readonly controls: SequenceControls | undefined;
		}
	>,
	componentName: '<TransitionSeries.Transition>',
	componentIdentity: 'dev.remotion.transitions.TransitionSeries.Transition',
	schema: transitionSeriesTransitionSchema,
	supportsEffects: false,
}) as TransitionSeriesTransitionComponent;

type ResolvedTransitionSeriesOverlayProps = TransitionSeriesOverlayProps & {
	readonly controls: SequenceControls | null | undefined;
	readonly stack: string | null;
};

type InternalTransitionSeriesOverlayProps =
	ResolvedTransitionSeriesOverlayProps & {
		readonly _remotionInternalRender:
			| ((props: ResolvedTransitionSeriesOverlayProps) => React.ReactNode)
			| null;
	};

const SeriesOverlayInner: FC<InternalTransitionSeriesOverlayProps> = ({
	stack = null,
	_remotionInternalRender = null,
	...props
}) => {
	if (_remotionInternalRender) {
		return _remotionInternalRender({...props, stack});
	}

	return null;
};

const transitionSeriesOverlaySchema = {} satisfies InteractivitySchema;

const SeriesOverlay = Interactive.withSchema({
	Component: SeriesOverlayInner as unknown as React.ComponentType<
		TransitionSeriesOverlayProps & {
			readonly controls: SequenceControls | undefined;
		}
	>,
	componentName: '<TransitionSeries.Overlay>',
	componentIdentity: 'dev.remotion.transitions.TransitionSeries.Overlay',
	schema: transitionSeriesOverlaySchema,
	supportsEffects: false,
}) as FC<TransitionSeriesOverlayProps>;

type LayoutBasedProps =
	true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? AbsoluteFillLayout
		: LayoutAndStyle;

type SeriesSequenceProps = PropsWithChildren<
	{
		readonly durationInFrames: number;
		readonly offset?: number;
		readonly className?: string;
	} & LayoutBasedProps &
		Pick<
			SequencePropsWithoutDuration,
			'name' | 'showInTimeline' | 'freeze' | 'hidden' | 'trimBefore'
		>
>;

type ResolvedSeriesSequenceProps = SeriesSequenceProps & {
	readonly controls: SequenceControls | null | undefined;
	readonly stack: string | null;
};

type InternalSeriesSequenceProps = ResolvedSeriesSequenceProps & {
	readonly _remotionInternalRender:
		| ((props: ResolvedSeriesSequenceProps) => React.ReactNode)
		| null;
};

const transitionSeriesSequenceSchema = {
	durationInFrames: Internals.durationInFramesField,
	name: Internals.sequenceSchema.name,
	hidden: Internals.sequenceSchema.hidden,
	showInTimeline: Internals.sequenceSchema.showInTimeline,
	freeze: Internals.freezeField,
	trimBefore: Internals.sequenceSchema.trimBefore,
	layout: Internals.sequenceSchema.layout,
} as const satisfies InteractivitySchema;

const SeriesSequenceInner: FC<InternalSeriesSequenceProps> = ({
	offset = 0,
	className = '',
	stack = null,
	_remotionInternalRender = null,
	...props
}) => {
	if (_remotionInternalRender) {
		return _remotionInternalRender({
			...props,
			offset,
			className: className || undefined,
			stack,
		});
	}

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{props.children}</>;
};

const SeriesSequence = Interactive.withSchema({
	Component: SeriesSequenceInner as unknown as React.ComponentType<
		SeriesSequenceProps & {
			readonly controls: SequenceControls | undefined;
		}
	>,
	componentName: '<TransitionSeries.Sequence>',
	componentIdentity: 'dev.remotion.transitions.TransitionSeries.Sequence',
	schema: transitionSeriesSequenceSchema,
	supportsEffects: false,
}) as FC<SeriesSequenceProps>;

const transitionSeriesSchema = {
	name: Internals.sequenceSchema.name,
	hidden: Internals.sequenceSchema.hidden,
	showInTimeline: Internals.sequenceSchema.showInTimeline,
	from: Internals.fromField,
	freeze: Internals.freezeField,
	layout: Internals.sequenceSchema.layout,
} as const satisfies InteractivitySchema;

type TransitionType<PresentationProps extends Record<string, unknown>> = {
	props: TransitionSeriesTransitionProps<PresentationProps>;
	type: typeof TransitionSeriesTransition;
};

type OverlayType = {
	props: TransitionSeriesOverlayProps;
	type: typeof SeriesOverlay;
};

type TypeChild<PresentationProps extends Record<string, unknown>> =
	| {
			props: SeriesSequenceProps;
			type: typeof SeriesSequence;
	  }
	| TransitionType<PresentationProps>
	| OverlayType
	| string;

export type DrawFunction = (
	prevImage: ElementImage | null,
	nextImage: ElementImage | null,
	progress: number,
) => void;

type ElementImageAndProgress = {
	elementImage: ElementImage | null;
	progress: number | null;
	draw: DrawFunction | null;
};

type ImageMap = Record<number, ElementImageAndProgress>;

const TransitionSeriesChildren: FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const prevImageRef = useRef<ImageMap>({});
	const nextImageRef = useRef<ImageMap>({});

	const flattedChildren = useMemo(() => {
		return flattenChildren(children);
	}, [children]);

	const drawIfSynced = useCallback((index: number) => {
		const prevImage = prevImageRef?.current?.[index];
		const nextImage = nextImageRef?.current?.[index];
		if (!nextImage?.elementImage && prevImage?.elementImage) {
			nextImage?.draw?.(null, null, 0);
			prevImage?.draw?.(prevImage?.elementImage ?? null, null, 0);
			return;
		}

		if (!prevImage?.elementImage && nextImage?.elementImage) {
			prevImage?.draw?.(null, null, 0);
			nextImage?.draw?.(null, nextImage?.elementImage ?? null, 0);
			return;
		}

		if (
			(prevImage && nextImage && prevImage.progress === nextImage.progress) ||
			!prevImage?.elementImage ||
			!nextImage?.elementImage
		) {
			prevImage?.draw?.(
				prevImage?.elementImage ?? null,
				nextImage?.elementImage ?? null,
				prevImage?.progress ?? nextImage?.progress ?? 0,
			);
			nextImage?.draw?.(null, null, 0);
		}
	}, []);

	const onNextElementImage = useCallback(
		(
			elementImage: ElementImage | null,
			progress: number | null,
			draw: DrawFunction | null,
			index: number,
		) => {
			prevImageRef.current[index] = {elementImage, progress, draw};

			drawIfSynced(index);
		},
		[drawIfSynced],
	);

	const onPrevElementImage = useCallback(
		(
			elementImage: ElementImage | null,
			progress: number | null,
			draw: DrawFunction | null,
			index: number,
		) => {
			nextImageRef.current[index] = {elementImage, progress, draw};

			drawIfSynced(index);
		},
		[drawIfSynced],
	);

	const childrenValue = useMemo(() => {
		type OverlayRender = {
			readonly cutPoint: number;
			readonly overlayFrom: number;
			readonly durationInFrames: number;
			readonly overlayOffset: number;
			readonly halfDuration: number;
			readonly children: React.ReactNode;
			readonly index: number;
			readonly controls: SequenceControls | null | undefined;
			readonly stack: string | null;
		};

		type RenderState = {
			readonly index: number;
			readonly transitionOffsets: number;
			readonly startFrame: number;
			readonly overlayRenders: readonly OverlayRender[];
			readonly sequenceDurations: readonly number[];
			readonly pendingOverlayValidation: boolean;
		};

		const renderChildren = (state: RenderState): React.ReactNode => {
			const {
				index: i,
				transitionOffsets,
				startFrame,
				overlayRenders,
				sequenceDurations,
				pendingOverlayValidation,
			} = state;

			if (i === flattedChildren.length) {
				return overlayRenders.map((info) => (
					<SequenceWithoutSchema
						key={`overlay-${info.index}`}
						from={Math.round(info.overlayFrom)}
						durationInFrames={info.durationInFrames}
						name="<TS.Overlay>"
						_remotionInternalDocumentationLink="https://www.remotion.dev/docs/transitions/transitionseries"
						_remotionInternalStack={info.stack ?? undefined}
						controls={info.controls ?? undefined}
						layout="absolute-fill"
					>
						{info.children}
					</SequenceWithoutSchema>
				));
			}

			const child = flattedChildren[i];
			const current = child as unknown as TypeChild<Record<string, unknown>>;
			const renderNext = (overrides: Partial<RenderState> = {}) => {
				return renderChildren({...state, ...overrides, index: i + 1});
			};

			if (typeof current === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (current.trim() === '') {
					return renderNext();
				}

				throw new TypeError(
					`The <TransitionSeries /> component only accepts a list of <TransitionSeries.Sequence /> components as its children, but you passed a string "${current}"`,
				);
			}

			const hasPrev = flattedChildren[i - 1] as TypeChild<
				Record<string, unknown>
			>;
			const nextPrev = flattedChildren[i + 1] as TypeChild<
				Record<string, unknown>
			>;

			const prevIsTransition =
				typeof hasPrev === 'string' || typeof hasPrev === 'undefined'
					? false
					: hasPrev.type === TransitionSeriesTransition;

			const prevIsOverlay =
				typeof hasPrev === 'string' || typeof hasPrev === 'undefined'
					? false
					: hasPrev.type === SeriesOverlay;

			// Handle overlay
			if (current.type === SeriesOverlay) {
				// Validate: two overlays in a row
				if (prevIsOverlay) {
					throw new TypeError(
						`A <TransitionSeries.Overlay /> component must not be followed by another <TransitionSeries.Overlay /> component (nth children = ${
							i - 1
						} and ${i})`,
					);
				}

				// Validate: overlay next to transition
				if (prevIsTransition) {
					throw new TypeError(
						`A <TransitionSeries.Transition /> component must not be followed by a <TransitionSeries.Overlay /> component (nth children = ${
							i - 1
						} and ${i})`,
					);
				}

				const nextIsTransition =
					typeof nextPrev === 'string' || typeof nextPrev === 'undefined'
						? false
						: nextPrev.type === TransitionSeriesTransition;
				if (nextIsTransition) {
					throw new TypeError(
						`A <TransitionSeries.Overlay /> component must not be followed by a <TransitionSeries.Transition /> component (nth children = ${i} and ${
							i + 1
						})`,
					);
				}

				const castedOverlay = current as React.ReactElement<
					InternalTransitionSeriesOverlayProps,
					typeof SeriesOverlay
				>;

				return React.cloneElement(castedOverlay, {
					_remotionInternalRender: (overlayProps) => {
						validateDurationInFrames(overlayProps.durationInFrames, {
							component: `of a <TransitionSeries.Overlay /> component`,
							allowFloats: false,
						});

						const overlayOffset = overlayProps.offset ?? 0;
						if (Number.isNaN(overlayOffset)) {
							throw new TypeError(
								`The "offset" property of a <TransitionSeries.Overlay /> must not be NaN, but got NaN.`,
							);
						}

						if (!Number.isFinite(overlayOffset)) {
							throw new TypeError(
								`The "offset" property of a <TransitionSeries.Overlay /> must be finite, but got ${overlayOffset}.`,
							);
						}

						if (overlayOffset % 1 !== 0) {
							throw new TypeError(
								`The "offset" property of a <TransitionSeries.Overlay /> must be an integer, but got ${overlayOffset}.`,
							);
						}

						// Find the previous sequence (the cut point is at startFrame + transitionOffsets)
						const cutPoint = startFrame + transitionOffsets;
						const halfDuration = overlayProps.durationInFrames / 2;
						const overlayFrom = cutPoint - halfDuration + overlayOffset;

						if (overlayFrom < 0) {
							throw new TypeError(
								`A <TransitionSeries.Overlay /> extends before frame 0. The overlay starts at frame ${overlayFrom}. Reduce the duration or adjust the offset.`,
							);
						}

						// Validate: overlay must not exceed the previous sequence duration
						const prevSeqIdx = sequenceDurations.length - 1;
						if (prevSeqIdx >= 0) {
							const overlayStartInPrev = halfDuration - overlayOffset;
							if (overlayStartInPrev > sequenceDurations[prevSeqIdx]) {
								throw new TypeError(
									`A <TransitionSeries.Overlay /> extends beyond the previous sequence. The overlay needs ${overlayStartInPrev} frames before the cut, but the previous sequence is only ${sequenceDurations[prevSeqIdx]} frames long.`,
								);
							}
						}

						// Store overlay info for deferred rendering and validate the other
						// side once the next sequence has resolved its interactive props.
						const overlayRender: OverlayRender = {
							cutPoint,
							overlayFrom,
							durationInFrames: overlayProps.durationInFrames,
							overlayOffset,
							halfDuration,
							children: overlayProps.children,
							index: i,
							controls: overlayProps.controls,
							stack: overlayProps.stack,
						};

						return renderNext({
							overlayRenders: [...overlayRenders, overlayRender],
							pendingOverlayValidation: true,
						});
					},
				});
			}

			if (current.type === TransitionSeriesTransition) {
				if (prevIsTransition) {
					throw new TypeError(
						`A <TransitionSeries.Transition /> component must not be followed by another <TransitionSeries.Transition /> component (nth children = ${
							i - 1
						} and ${i})`,
					);
				}

				if (prevIsOverlay) {
					throw new TypeError(
						`A <TransitionSeries.Overlay /> component must not be followed by a <TransitionSeries.Transition /> component (nth children = ${
							i - 1
						} and ${i})`,
					);
				}

				const castedTransition = current as React.ReactElement<
					InternalTransitionSeriesTransitionProps<Record<string, unknown>>,
					typeof TransitionSeriesTransition
				>;

				return React.cloneElement(castedTransition, {
					_remotionInternalRender: (transitionProps) => {
						const transitionDuration =
							transitionProps.timing.getDurationInFrames({fps});
						const transitionFrom =
							startFrame + transitionOffsets - transitionDuration;

						return (
							<>
								{transitionDuration > 0 ? (
									<SequenceWithoutSchema
										from={transitionFrom}
										durationInFrames={transitionDuration}
										name="<TS.Transition>"
										_remotionInternalDocumentationLink="https://www.remotion.dev/docs/transitions/transitionseries"
										_remotionInternalStack={transitionProps.stack ?? undefined}
										controls={transitionProps.controls ?? undefined}
										layout="none"
									/>
								) : null}
								{renderNext()}
							</>
						);
					},
				});
			}

			if (current.type !== SeriesSequence) {
				throw new TypeError(
					`The <TransitionSeries /> component only accepts a list of <TransitionSeries.Sequence />, <TransitionSeries.Transition />, and <TransitionSeries.Overlay /> components as its children, but got ${current} instead`,
				);
			}

			const prev: TransitionType<Record<string, unknown>> | null =
				typeof hasPrev === 'string' || typeof hasPrev === 'undefined'
					? null
					: hasPrev.type === TransitionSeriesTransition
						? (hasPrev as TransitionType<Record<string, unknown>>)
						: null;

			const next: TransitionType<Record<string, unknown>> | null =
				typeof nextPrev === 'string' || typeof nextPrev === 'undefined'
					? null
					: nextPrev.type === TransitionSeriesTransition
						? (nextPrev as TransitionType<Record<string, unknown>>)
						: null;

			const castedChildAgain = current as React.ReactElement<
				InternalSeriesSequenceProps,
				typeof SeriesSequence
			>;

			return React.cloneElement(castedChildAgain, {
				_remotionInternalRender: (resolvedProps) => {
					const durationInFramesProp = resolvedProps.durationInFrames;
					const debugInfo = `index = ${i}, duration = ${durationInFramesProp}`;
					const {
						durationInFrames,
						children: sequenceChildren,
						offset: offsetProp,
						controls,
						stack,
						from: _from,
						...passedProps
					} = resolvedProps as InternalSeriesSequenceProps & {from: never};
					validateDurationInFrames(durationInFramesProp, {
						component: `of a <TransitionSeries.Sequence /> component`,
						allowFloats: true,
					});
					const offset = offsetProp ?? 0;
					if (Number.isNaN(offset)) {
						throw new TypeError(
							`The "offset" property of a <TransitionSeries.Sequence /> must not be NaN, but got NaN (${debugInfo}).`,
						);
					}

					if (!Number.isFinite(offset)) {
						throw new TypeError(
							`The "offset" property of a <TransitionSeries.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
						);
					}

					if (offset % 1 !== 0) {
						throw new TypeError(
							`The "offset" property of a <TransitionSeries.Sequence /> must be finite, but got ${offset} (${debugInfo}).`,
						);
					}

					let resolvedTransitionOffsets = transitionOffsets;
					let resolvedStartFrame = startFrame;
					let resolvedPendingOverlayValidation = pendingOverlayValidation;
					const currentStartFrame = resolvedStartFrame + offset;

					let duration = 0;

					if (prev) {
						duration = prev.props.timing.getDurationInFrames({
							fps,
						});
						resolvedTransitionOffsets -= duration;
					}

					let actualStartFrame = currentStartFrame + resolvedTransitionOffsets;

					resolvedStartFrame += durationInFramesProp + offset;

					// Handle the case where the first item is a transition
					if (actualStartFrame < 0) {
						resolvedStartFrame -= actualStartFrame;
						actualStartFrame = 0;
					}

					// Track resolved durations so later sequences and overlay validation use
					// the live Studio override instead of the original JSX value.
					const nextSequenceDurations = [
						...sequenceDurations,
						durationInFramesProp,
					];

					// Validate: check if a preceding overlay extends beyond this sequence
					if (resolvedPendingOverlayValidation) {
						resolvedPendingOverlayValidation = false;
						const lastOverlay = overlayRenders[overlayRenders.length - 1];
						if (!lastOverlay) {
							throw new Error('Expected an overlay to validate');
						}

						const framesAfterCut =
							lastOverlay.halfDuration + lastOverlay.overlayOffset;
						if (framesAfterCut > durationInFramesProp) {
							throw new TypeError(
								`A <TransitionSeries.Overlay /> extends beyond the next sequence. The overlay needs ${framesAfterCut} frames after the cut, but the next sequence is only ${durationInFramesProp} frames long.`,
							);
						}
					}

					const renderSequenceAndRest = (sequence: React.ReactNode) => {
						return (
							<>
								{sequence}
								{renderNext({
									transitionOffsets: resolvedTransitionOffsets,
									startFrame: resolvedStartFrame,
									sequenceDurations: nextSequenceDurations,
									pendingOverlayValidation: resolvedPendingOverlayValidation,
								})}
							</>
						);
					};

					const nextProgress = next
						? next.props.timing.getProgress({
								frame:
									frame -
									actualStartFrame -
									durationInFrames +
									next.props.timing.getDurationInFrames({fps}),
								fps,
							})
						: null;

					const prevProgress = prev
						? prev.props.timing.getProgress({
								frame: frame - actualStartFrame,
								fps,
							})
						: null;

					if (
						next &&
						durationInFramesProp < next.props.timing.getDurationInFrames({fps})
					) {
						throw new Error(
							`The duration of a <TransitionSeries.Sequence /> must not be shorter than the duration of the next <TransitionSeries.Transition />. The transition is ${next.props.timing.getDurationInFrames(
								{fps},
							)} frames long, but the sequence is only ${durationInFramesProp} frames long (${debugInfo})`,
						);
					}

					if (
						prev &&
						durationInFramesProp < prev.props.timing.getDurationInFrames({fps})
					) {
						throw new Error(
							`The duration of a <TransitionSeries.Sequence /> must not be shorter than the duration of the previous <TransitionSeries.Transition />. The transition is ${prev.props.timing.getDurationInFrames(
								{fps},
							)} frames long, but the sequence is only ${durationInFramesProp} frames long (${debugInfo})`,
						);
					}

					if (next && prev && nextProgress !== null && prevProgress !== null) {
						const nextPresentation = next.props.presentation ?? slide();
						const prevPresentation = prev.props.presentation ?? slide();

						const UppercaseNextPresentation = nextPresentation.component;
						const UppercasePrevPresentation = prevPresentation.component;

						return renderSequenceAndRest(
							<SequenceWithoutSchema
								key={i}
								from={actualStartFrame}
								durationInFrames={durationInFramesProp}
								{...passedProps}
								name={passedProps.name || '<TS.Sequence>'}
								_remotionInternalDocumentationLink={
									passedProps.name
										? undefined
										: 'https://www.remotion.dev/docs/transitions/transitionseries'
								}
								_remotionInternalStack={stack ?? undefined}
								controls={controls ?? undefined}
							>
								<UppercaseNextPresentation
									passedProps={nextPresentation.props ?? {}}
									presentationDirection="exiting"
									presentationProgress={nextProgress}
									presentationDurationInFrames={next.props.timing.getDurationInFrames(
										{fps},
									)}
									onElementImage={() => {
										throw new Error('Should not call when exiting');
									}}
									onUnmount={() => {
										throw new Error('Should not call when exiting');
									}}
									bothEnteringAndExiting
								>
									<WrapInExitingProgressContext
										presentationProgress={nextProgress}
									>
										<UppercasePrevPresentation
											passedProps={prevPresentation.props ?? {}}
											presentationDirection="entering"
											presentationProgress={prevProgress}
											presentationDurationInFrames={prev.props.timing.getDurationInFrames(
												{fps},
											)}
											onElementImage={(elementImage, draw) => {
												onPrevElementImage(
													elementImage,
													nextProgress,
													draw,
													i + 1,
												);
												onNextElementImage(
													elementImage,
													prevProgress,
													draw,
													i - 1,
												);
											}}
											onUnmount={() => {
												onPrevElementImage(null, null, null, i + 1);
												onNextElementImage(null, null, null, i - 1);
											}}
											bothEnteringAndExiting
										>
											<WrapInEnteringProgressContext
												presentationProgress={prevProgress}
											>
												{sequenceChildren}
											</WrapInEnteringProgressContext>
										</UppercasePrevPresentation>
									</WrapInExitingProgressContext>
								</UppercaseNextPresentation>
							</SequenceWithoutSchema>,
						);
					}

					if (prevProgress !== null && prev) {
						const prevPresentation = prev.props.presentation ?? slide();

						const UppercasePrevPresentation = prevPresentation.component;

						return renderSequenceAndRest(
							<SequenceWithoutSchema
								key={i}
								from={actualStartFrame}
								durationInFrames={durationInFramesProp}
								{...passedProps}
								name={passedProps.name || '<TS.Sequence>'}
								_remotionInternalDocumentationLink={
									passedProps.name
										? undefined
										: 'https://www.remotion.dev/docs/transitions/transitionseries'
								}
								_remotionInternalStack={stack ?? undefined}
								controls={controls ?? undefined}
							>
								<UppercasePrevPresentation
									passedProps={prevPresentation.props ?? {}}
									presentationDirection="entering"
									presentationProgress={prevProgress}
									presentationDurationInFrames={prev.props.timing.getDurationInFrames(
										{fps},
									)}
									onElementImage={(elementImage, draw) =>
										onNextElementImage(elementImage, prevProgress, draw, i - 1)
									}
									onUnmount={() => {
										onNextElementImage(null, null, null, i - 1);
									}}
									bothEnteringAndExiting={false}
								>
									<WrapInEnteringProgressContext
										presentationProgress={prevProgress}
									>
										{sequenceChildren}
									</WrapInEnteringProgressContext>
								</UppercasePrevPresentation>
							</SequenceWithoutSchema>,
						);
					}

					if (nextProgress !== null && next) {
						const nextPresentation = next.props.presentation ?? slide();

						const UppercaseNextPresentation = nextPresentation.component;

						return renderSequenceAndRest(
							<SequenceWithoutSchema
								key={i}
								from={actualStartFrame}
								durationInFrames={durationInFramesProp}
								{...passedProps}
								name={passedProps.name || '<TS.Sequence>'}
								_remotionInternalDocumentationLink={
									passedProps.name
										? undefined
										: 'https://www.remotion.dev/docs/transitions/transitionseries'
								}
								_remotionInternalStack={stack ?? undefined}
								controls={controls ?? undefined}
							>
								<UppercaseNextPresentation
									passedProps={nextPresentation.props ?? {}}
									presentationDirection="exiting"
									presentationProgress={nextProgress}
									presentationDurationInFrames={next.props.timing.getDurationInFrames(
										{fps},
									)}
									onElementImage={(elementImage, draw) =>
										onPrevElementImage(elementImage, nextProgress, draw, i + 1)
									}
									onUnmount={() => {
										onPrevElementImage(null, null, null, i + 1);
									}}
									bothEnteringAndExiting={false}
								>
									<WrapInExitingProgressContext
										presentationProgress={nextProgress}
									>
										{sequenceChildren}
									</WrapInExitingProgressContext>
								</UppercaseNextPresentation>
							</SequenceWithoutSchema>,
						);
					}

					return renderSequenceAndRest(
						<SequenceWithoutSchema
							key={i}
							from={actualStartFrame}
							durationInFrames={durationInFramesProp}
							{...passedProps}
							name={passedProps.name || '<TS.Sequence>'}
							_remotionInternalDocumentationLink={
								passedProps.name
									? undefined
									: 'https://www.remotion.dev/docs/transitions/transitionseries'
							}
							_remotionInternalStack={stack ?? undefined}
							controls={controls ?? undefined}
						>
							{sequenceChildren}
						</SequenceWithoutSchema>,
					);
				},
			});
		};

		return renderChildren({
			index: 0,
			transitionOffsets: 0,
			startFrame: 0,
			overlayRenders: [],
			sequenceDurations: [],
			pendingOverlayValidation: false,
		});
	}, [flattedChildren, fps, frame, onPrevElementImage, onNextElementImage]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{childrenValue}</>;
};

/*
 * @description Manages a series of transitions and sequences for advanced animation controls in Remotion projects, handling cases with varying timings and presentations.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/transitionseries)
 */
const TransitionSeriesInner: FC<SequencePropsWithoutDuration> = (props) => {
	const {
		children,
		name,
		layout: passedLayout,
		controls,
		...otherProps
	} = props as SequencePropsWithoutDuration & {
		readonly controls: SequenceControls | null;
	};
	const {stack, ...propsForSequence} = otherProps as typeof otherProps & {
		readonly stack: string | null;
	};
	const displayName = name ?? '<TransitionSeries>';
	const layout = passedLayout ?? 'absolute-fill';
	if (
		NoReactInternals.ENABLE_V5_BREAKING_CHANGES &&
		layout !== 'absolute-fill'
	) {
		throw new TypeError(
			`The "layout" prop of <TransitionSeries /> is not supported anymore in v5. TransitionSeries' must be absolutely positioned.`,
		);
	}

	return (
		<Sequence
			name={displayName}
			layout={layout}
			_remotionInternalDocumentationLink={
				name === undefined
					? 'https://www.remotion.dev/docs/transitions/transitionseries'
					: undefined
			}
			{...propsForSequence}
			_remotionInternalStack={stack ?? undefined}
			controls={controls ?? undefined}
		>
			<TransitionSeriesChildren>{children}</TransitionSeriesChildren>
		</Sequence>
	);
};

const TransitionSeries = Interactive.withSchema({
	Component: TransitionSeriesInner,
	componentName: '<TransitionSeries>',
	componentIdentity: 'dev.remotion.transitions.TransitionSeries',
	schema: transitionSeriesSchema,
	supportsEffects: false,
}) as FC<SequencePropsWithoutDuration> & {
	Sequence: typeof SeriesSequence;
	Transition: typeof TransitionSeriesTransition;
	Overlay: typeof SeriesOverlay;
};

TransitionSeries.Sequence = SeriesSequence;
TransitionSeries.Transition = TransitionSeriesTransition;
TransitionSeries.Overlay = SeriesOverlay;

export {TransitionSeries};
