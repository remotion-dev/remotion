import type {FC, PropsWithChildren} from 'react';
import {Children, useMemo} from 'react';
import type {
	AbsoluteFillLayout,
	LayoutAndStyle,
	SequencePropsWithoutDuration,
} from 'remotion';
import {Internals, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
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

const TransitionSeriesTransition = function <
	PresentationProps extends Record<string, unknown>,
>(_props: TransitionSeriesTransitionProps<PresentationProps>) {
	return null;
};

const SeriesOverlay: FC<TransitionSeriesOverlayProps> = () => {
	return null;
};

type LayoutBasedProps =
	true extends typeof NoReactInternals.ENABLE_V5_BREAKING_CHANGES
		? AbsoluteFillLayout
		: LayoutAndStyle;

type SeriesSequenceProps = PropsWithChildren<
	{
		readonly durationInFrames: number;
		readonly offset?: number;
		readonly className?: string;
		/**
		 * @deprecated For internal use only
		 */
		readonly stack?: string;
	} & LayoutBasedProps &
		Pick<SequencePropsWithoutDuration, 'name'>
>;

const SeriesSequence = ({children}: SeriesSequenceProps) => {
	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{children}</>;
};

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

const TransitionSeriesChildren: FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const childrenValue = useMemo(() => {
		let transitionOffsets = 0;
		let startFrame = 0;
		const flattedChildren = flattenChildren(children);

		// Collect overlay render info to emit after the main loop
		const overlayRenders: React.ReactNode[] = [];

		// Track sequence durations for overlay validation
		const sequenceDurations: number[] = [];
		let pendingOverlayValidation = false;

		const mainChildren = Children.map(flattedChildren, (child, i) => {
			const current = child as unknown as TypeChild<Record<string, unknown>>;
			if (typeof current === 'string') {
				// Don't throw if it's just some accidential whitespace
				if (current.trim() === '') {
					return null;
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

				const overlayProps = (current as OverlayType).props;

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

				// We'll validate the next sequence side after we process it
				pendingOverlayValidation = true;
				// Store overlay info for deferred rendering
				overlayRenders.push({
					cutPoint,
					overlayFrom,
					durationInFrames: overlayProps.durationInFrames,
					overlayOffset,
					halfDuration,
					children: overlayProps.children,
					index: i,
				} as unknown as React.ReactNode);

				return null;
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

				return null;
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

			const castedChildAgain = current as {
				props: SeriesSequenceProps;
				type: typeof SeriesSequence;
			};

			const debugInfo = `index = ${i}, duration = ${castedChildAgain.props.durationInFrames}`;

			if (!castedChildAgain?.props.children) {
				throw new TypeError(
					`A <TransitionSeries.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`,
				);
			}

			const durationInFramesProp = castedChildAgain.props.durationInFrames;
			const {
				durationInFrames,
				children: _children,
				...passedProps
			} = castedChildAgain.props;
			validateDurationInFrames(durationInFramesProp, {
				component: `of a <TransitionSeries.Sequence /> component`,
				allowFloats: true,
			});
			const offset = castedChildAgain.props.offset ?? 0;
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

			const currentStartFrame = startFrame + offset;

			let duration = 0;

			if (prev) {
				duration = prev.props.timing.getDurationInFrames({
					fps,
				});
				transitionOffsets -= duration;
			}

			let actualStartFrame = currentStartFrame + transitionOffsets;

			startFrame += durationInFramesProp + offset;

			// Handle the case where the first item is a transition
			if (actualStartFrame < 0) {
				startFrame -= actualStartFrame;
				actualStartFrame = 0;
			}

			// Track sequence durations for overlay validation
			sequenceDurations.push(durationInFramesProp);

			// Validate: check if a preceding overlay extends beyond this sequence
			if (pendingOverlayValidation) {
				pendingOverlayValidation = false;
				const lastOverlay = overlayRenders[
					overlayRenders.length - 1
				] as unknown as {
					halfDuration: number;
					overlayOffset: number;
					durationInFrames: number;
				};
				const framesAfterCut =
					lastOverlay.halfDuration + lastOverlay.overlayOffset;
				if (framesAfterCut > durationInFramesProp) {
					throw new TypeError(
						`A <TransitionSeries.Overlay /> extends beyond the next sequence. The overlay needs ${framesAfterCut} frames after the cut, but the next sequence is only ${durationInFramesProp} frames long.`,
					);
				}
			}

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

				return (
					<Sequence
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						from={actualStartFrame}
						durationInFrames={durationInFramesProp}
						{...passedProps}
						name={passedProps.name || '<TS.Sequence>'}
					>
						<UppercaseNextPresentation
							passedProps={nextPresentation.props ?? {}}
							presentationDirection="exiting"
							presentationProgress={nextProgress}
							presentationDurationInFrames={next.props.timing.getDurationInFrames(
								{fps},
							)}
						>
							<WrapInExitingProgressContext presentationProgress={nextProgress}>
								<UppercasePrevPresentation
									passedProps={prevPresentation.props ?? {}}
									presentationDirection="entering"
									presentationProgress={prevProgress}
									presentationDurationInFrames={prev.props.timing.getDurationInFrames(
										{fps},
									)}
								>
									<WrapInEnteringProgressContext
										presentationProgress={prevProgress}
									>
										{child}
									</WrapInEnteringProgressContext>
								</UppercasePrevPresentation>
							</WrapInExitingProgressContext>
						</UppercaseNextPresentation>
					</Sequence>
				);
			}

			if (prevProgress !== null && prev) {
				const prevPresentation = prev.props.presentation ?? slide();

				const UppercasePrevPresentation = prevPresentation.component;

				return (
					<Sequence
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						from={actualStartFrame}
						durationInFrames={durationInFramesProp}
						{...passedProps}
						name={passedProps.name || '<TS.Sequence>'}
					>
						<UppercasePrevPresentation
							passedProps={prevPresentation.props ?? {}}
							presentationDirection="entering"
							presentationProgress={prevProgress}
							presentationDurationInFrames={prev.props.timing.getDurationInFrames(
								{fps},
							)}
						>
							<WrapInEnteringProgressContext
								presentationProgress={prevProgress}
							>
								{child}
							</WrapInEnteringProgressContext>
						</UppercasePrevPresentation>
					</Sequence>
				);
			}

			if (nextProgress !== null && next) {
				const nextPresentation = next.props.presentation ?? slide();

				const UppercaseNextPresentation = nextPresentation.component;

				return (
					<Sequence
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						from={actualStartFrame}
						durationInFrames={durationInFramesProp}
						{...passedProps}
						name={passedProps.name || '<TS.Sequence>'}
					>
						<UppercaseNextPresentation
							passedProps={nextPresentation.props ?? {}}
							presentationDirection="exiting"
							presentationProgress={nextProgress}
							presentationDurationInFrames={next.props.timing.getDurationInFrames(
								{fps},
							)}
						>
							<WrapInExitingProgressContext presentationProgress={nextProgress}>
								{child}
							</WrapInExitingProgressContext>
						</UppercaseNextPresentation>
					</Sequence>
				);
			}

			return (
				<Sequence
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					from={actualStartFrame}
					durationInFrames={durationInFramesProp}
					{...passedProps}
					name={passedProps.name || '<TS.Sequence>'}
				>
					{child}
				</Sequence>
			);
		});

		// Now render overlay sequences
		const overlayElements = overlayRenders.map((overlayInfo) => {
			const info = overlayInfo as unknown as {
				cutPoint: number;
				overlayFrom: number;
				durationInFrames: number;
				children: React.ReactNode;
				index: number;
			};

			return (
				<Sequence
					key={`overlay-${info.index}`}
					from={Math.round(info.overlayFrom)}
					durationInFrames={info.durationInFrames}
					name="<TS.Overlay>"
					layout="absolute-fill"
				>
					{info.children}
				</Sequence>
			);
		});

		return [...(mainChildren || []), ...overlayElements];
	}, [children, fps, frame]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	return <>{childrenValue}</>;
};

/*
 * @description Manages a series of transitions and sequences for advanced animation controls in Remotion projects, handling cases with varying timings and presentations.
 * @see [Documentation](https://www.remotion.dev/docs/transitions/transitionseries)
 */
export const TransitionSeries: FC<SequencePropsWithoutDuration> & {
	Sequence: typeof SeriesSequence;
	Transition: typeof TransitionSeriesTransition;
	Overlay: typeof SeriesOverlay;
} = ({children, name, layout: passedLayout, ...otherProps}) => {
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
		<Sequence name={displayName} layout={layout} {...otherProps}>
			<TransitionSeriesChildren>{children}</TransitionSeriesChildren>
		</Sequence>
	);
};

TransitionSeries.Sequence = SeriesSequence;
TransitionSeries.Transition = TransitionSeriesTransition;
TransitionSeries.Overlay = SeriesOverlay;

Internals.addSequenceStackTraces(TransitionSeries);
Internals.addSequenceStackTraces(SeriesSequence);
